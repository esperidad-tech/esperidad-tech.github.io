"""Enquête 3, étape 3 (Bible § 13.14) : le Sage, le matin et l'après-midi (Playwright).
Partie A : le tableau d'Odette (Assembler les runes, le dessin du tableau ; réussi), le Livre d'or (code pour l'Alchimiste), l'herbier
(trois énigmes, chacune avec son 🔊, et le code), les premiers doutes (un code du Barde, puis les deux : le texte change) ; l'après-midi,
la lettre et le carnet (la lettre est fausse), les sept chats (Moustache a six doigts), le plan des Fondateurs (l'alphabet secret),
rendre le tableau (5 pièces d'or, pas de filet : il a déjà la lettre), QUI (l'écriture et l'aveu).
Partie B : le tableau raté ; puis le filet de la lettre (il ne l'a pas) : rendre le tableau… sans tableau, pas de rendu ;
partie C : tableau réussi, pas de lettre → le maire l'accroche sous le tableau, le Sage la reçoit.
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
    pts = lieu(pg, 'mairie')
    verifier(pts == ['tableau', 'livredor'], f'la mairie, le matin : le tableau et le Livre d\'or ({pts})')
    shot(pg, 'A-mairie')
    info = jouer(pg, 'tableau', True, 'A-tableau-jeu')
    verifier(info and info['type'] == 'runes' and info['params'].get('image') == 'tableau', 'le tableau : Assembler les runes, avec le dessin du tableau')
    verifier('Magnifique' in texte(pg), 'réussi : « Magnifique ! On l\'accrochera au-dessus du gâteau. »')
    fermer(pg)
    lieu(pg, 'mairie'); pg.locator('#voile [data-act=point][data-id=livredor]').click(); pg.wait_for_timeout(250)
    verifier('Livre d\'or' in texte(pg) and '_info:ecritures' in objets(pg) and pg.locator('#voile .b-donne').count() == 1, 'le Livre d\'or : le code « Les écritures du village » pour l\'Alchimiste')
    fermer(pg)
    t = page(pg, 'herbier')
    verifier(pg.locator('#livre-ici .lv-page.on .lv-lignes li').count() == 3 and pg.locator('#livre-ici .lv-page.on .lv-lignes .b-lire').count() == 3, 'l\'herbier : trois énigmes, chacune avec son 🔊')
    verifier('_info:herbier' in objets(pg) and 'quatre chemins' in t, 'et le code « L\'herbier » pour l\'Alchimiste')
    shot(pg, 'A-herbier')
    t = page(pg, 'doutes')
    verifier('🔒' in t or pg.locator('#livre-ici .lv-page.on .b-besoin').count() >= 1, 'les premiers doutes : fermés sans code du Barde')
    code(pg, 'info:poste')
    page(pg, 'doutes'); ev(pg, 'ouvrir-page', {'id': 'doutes'}); fermer(pg)
    t = page(pg, 'doutes')
    verifier('Pas de timbre' in t and 'capuchon' not in t, 'avec le code de Victor seulement : pas de timbre (rien sur le capuchon)')
    code(pg, 'info:capuchon')
    t = page(pg, 'doutes')
    verifier('capuchon' in t and 'Pas de timbre' in t, 'avec les deux codes : le texte complet')
    shot(pg, 'A-doutes')
    print('— Partie A : l\'après-midi')
    apresmidi(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'apresmidi', 'l\'après-midi')
    t = page(pg, 'fausse')
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0, 'la lettre et le carnet : fermé sans les codes')
    code(pg, 'obj:lettre'); code(pg, 'obj:carnet')
    page(pg, 'fausse'); ev(pg, 'ouvrir-page', {'id': 'fausse'}); fermer(pg)
    t = page(pg, 'fausse')
    verifier('la lettre est fausse' in t, 'la lettre est fausse')
    page(pg, 'chats'); ev(pg, 'ouvrir-page', {'id': 'chats'}); fermer(pg)
    t = page(pg, 'chats')
    verifier('sixième doigt' in t and '_info:six_doigts' in objets(pg), 'les sept chats : « Moustache a six doigts » pour le Pisteur')
    shot(pg, 'A-chats')
    page(pg, 'plan'); pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=plan]').click(); pg.wait_for_timeout(300)
    if pg.locator('#voile [data-act=mj-go]').count(): pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1200)
    pg.screenshot(path=f'{OUT}/A-plan-jeu.png')
    info = pg.evaluate("() => window.__mjCourant ? {type:window.__mjCourant.type, params:window.__mjCourant.params} : null")
    verifier(info and info['type'] == 'alphabet' and 'FONDATEURS' in info['params'].get('message', ''), 'le plan : l\'alphabet secret, « LE CHEMIN DES FONDATEURS »')
    pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(400); fermer(pg)
    t = page(pg, 'plan')
    verifier('Ne le montrer à personne' in t, 'le plan entre dans le Grand Livre')
    pts = lieu(pg, 'mairie')
    verifier('rendu' in pts, 'rendre le tableau : à la mairie, l\'après-midi')
    or0 = pg.evaluate("() => M.S.or || 0")
    pg.locator('#voile [data-act=point][data-id=rendu]').click(); pg.wait_for_timeout(250)
    verifier(pg.evaluate("() => M.S.or || 0") == or0 + 5 and 'accroche sous' not in texte(pg), '5 pièces d\'or ; pas de filet (il a déjà la lettre)')
    fermer(pg)
    code(pg, 'info:ecriture'); code(pg, 'info:aveu')
    page(pg, 'qui'); ev(pg, 'ouvrir-page', {'id': 'qui'}); fermer(pg)
    t = page(pg, 'qui')
    verifier('Mélusine a écrit la lettre' in t, 'QUI : Mélusine')
    shot(pg, 'A-qui')
    m = pg.evaluate("() => (M.etatMissions ? 1 : 0)")
    pg.close()

    print('— Partie C : le filet de la lettre')
    pg = debut(b, 'C')
    lieu(pg, 'mairie'); jouer(pg, 'tableau', True); fermer(pg)
    apresmidi(pg)
    lieu(pg, 'mairie'); pg.locator('#voile [data-act=point][data-id=rendu]').click(); pg.wait_for_timeout(250)
    verifier('accroche sous votre tableau' in texte(pg) and pg.evaluate("() => !!M.P().recus['obj:lettre']") and pg.locator('#voile .b-donne').count() == 1,
             'sans la lettre : le maire l\'accroche sous le tableau ; le Sage la reçoit, et son code est pour l\'Alchimiste')
    shot(pg, 'C-filet')
    fermer(pg)
    pts = lieu(pg, 'mairie')
    verifier('rendu' in pts, 'le point reste là')
    pg.locator('#voile [data-act=point][data-id=rendu]').click(); pg.wait_for_timeout(250)
    verifier('accroche sous votre tableau' in texte(pg), 'il garde le même texte (pas d\'or une deuxième fois)')
    pg.close()

    print('— Partie B : le tableau raté')
    pg = debut(b, 'B')
    lieu(pg, 'mairie'); jouer(pg, 'tableau', False); fermer(pg)
    apresmidi(pg)
    pts = lieu(pg, 'mairie')
    verifier('rendu' not in pts and 'sanstableau' in pts, f'tableau raté : rien à rendre, mais on peut passer voir le maire ({pts})')
    or0 = pg.evaluate("() => M.S.or || 0")
    pg.locator('#voile [data-act=point][data-id=sanstableau]').click(); pg.wait_for_timeout(250)
    verifier('accroche au mur' in texte(pg) and pg.evaluate("() => !!M.P().recus['obj:lettre']") and pg.evaluate("() => M.S.or || 0") == or0,
             'le filet de la lettre marche aussi sans tableau (et sans or)')
    pg.close()
    b.close()

print()
print('Erreurs de la console :', len(erreurs))
for e in erreurs[:12]: print('  ', e)
print('Échecs :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if echecs or erreurs else 0)
