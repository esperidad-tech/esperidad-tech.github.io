"""Enquête 3, étape 5 : le Pisteur, le matin, l'après-midi et la nuit (Playwright).
Chaque mini-jeu se lance pour de vrai (l'explication avant, le bouton jaune, l'écran des règles, « C'est parti ! », deux secondes de jeu,
une capture), puis le robot décide du résultat (réussi ou raté) pour essayer les deux chemins. Les codes des autres rôles sont tapés
comme un joueur (onglet 📜 Code). Deux parties :
  A (adulte) : tout réussi, la clé d'Anselme prise → la grille de la crypte ; pas de puits ;
  B (enfant) : l'oie ratée, les traces réussies du premier coup, la clé ratée → le puits. (A : les traces ratées une fois, puis réussies.)
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-pisteur.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-pisteur'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def voile(pg):
    return pg.evaluate("() => { var v = document.querySelector('#voile:not([hidden])'); return v ? v.innerText.replace(/\\s+/g, ' ') : ''; }")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle):
    """Taper un code comme un joueur : l'onglet 📜, les symboles, puis refermer la fenêtre qui s'ouvre."""
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(200)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(300)
    ok = pg.evaluate(f"() => '{cle}'.indexOf('moment:') === 0 || !!M.P().recus['{cle}']")   # (un code de moment change le moment : vérifié après)
    fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    return ok

def lieu(pg, l):
    """Ouvrir un lieu, et l'explorer si le bouton est là (un vrai clic). Renvoie les points visibles."""
    ev(pg, 'lieu', {'id': l})
    b = pg.locator('#voile [data-act=explorer]')
    if b.count(): b.first.click(); pg.wait_for_timeout(200)
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#voile [data-act=point]'), function(b){ return {id:b.dataset.id, off:b.disabled}; })")

def jouer_point(pg, l, pid, reussi, capt):
    """Un point avec mini-jeu : un vrai clic sur le point, l'explication, le bouton jaune, les règles, « C'est parti ! », puis le résultat."""
    pg.locator(f'#voile [data-act=point][data-id={pid}]').first.click(); pg.wait_for_timeout(250)
    verifier(pg.locator('#voile [data-act=mj-go]').count() == 1, f'{pid} : l\'explication avant le mini-jeu et son bouton')
    pg.screenshot(path=f'{OUT}/{capt}-avant.png')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    pg.screenshot(path=f'{OUT}/{capt}-regles.png')
    verifier(pg.locator('#mj-plein .mj-go').count() == 1, f'{pid} : l\'écran des règles et son bouton jaune')
    pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(2600)
    pg.screenshot(path=f'{OUT}/{capt}-jeu.png')
    info = pg.evaluate("() => window.__mjCourant ? {type:window.__mjCourant.type, params:window.__mjCourant.params, reessais:!!(window.__mjCourant.opt || {}).reessaisInfinis} : null")
    pg.evaluate(f"() => window.__finir({'true' if reussi else 'false'})"); pg.wait_for_timeout(500)
    pg.screenshot(path=f'{OUT}/{capt}-fin.png')
    return info

def partie(b, joueur, chemin):
    print(f'— partie {chemin} ({joueur})')
    pg = b.new_context(viewport={'width': 1180, 'height': 820}).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{chemin}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{chemin}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=pisteur]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Pisteur'); pg.click('[data-act=crea-fin]')
    pg.evaluate(f"() => {{ M.S.heros.joueur = '{joueur}'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }}")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(600)
    # le vrai mini-jeu se lance ; le robot le termine quand il veut (window.__finir)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      var vrai = MJ.lancer;
      MJ.lancer = function(el, type, params, fin, opt){
        var c = {type:type, params:params, fin:fin, fini:false, opt:opt};
        c.h = vrai.call(MJ, el, type, params, function(r){ if(!c.fini){ c.fini = true; fin(r); } }, opt);
        window.__mjCourant = c; return c.h;
      };
      window.__finir = function(ok){ var c = window.__mjCourant; if(!c || c.fini) return; c.fini = true; window.__mjCourant = null;
        try{ c.h.arreter(); }catch(e){}
        c.fin({reussi:ok, score:ok ? 1 : 0, essais:1, erreurs:0, detail:''}); }; }""")
    or0 = pg.evaluate("() => M.S.or")
    A = chemin == 'A'

    # ---------- le matin ----------
    print(' matin')
    verifier(pg.evaluate("() => M.etapesMission ? true : true"), 'le Carnet a ses missions')
    pts = lieu(pg, 'place')
    verifier([p['id'] for p in pts] == ['banderoles'], f'la place, le matin : les banderoles ({pts})')
    i = jouer_point(pg, 'place', 'banderoles', True, f'{chemin}-banderoles')
    verifier(i and i['type'] == 'visee' and i['params'].get('niveauEffectif') == 9, f'les banderoles : le nouveau tir à l\'arc (visée), niveau 9 ({i and i["type"]}, {i and i["params"].get("niveauEffectif")})')
    verifier('décoration' in voile(pg), 'les banderoles réussies : « Ça, c\'est de la décoration ! »')
    fermer(pg)
    pts = lieu(pg, 'boulangerie')
    verifier([p['id'] for p in pts] == ['oie'], 'la boulangerie, le matin : l\'oie')
    i = jouer_point(pg, 'boulangerie', 'oie', A, f'{chemin}-oie')
    verifier(i and i['params'].get('fuyard') == 'oie' and i['params'].get('decor') == 'ville', 'l\'oie : course-poursuite, une oie, en ville')
    verifier(i and i['params'].get('niveauEffectif') == 9, f'l\'oie : niveau 9 (Romain, 12 novembre) ({i and i["params"].get("niveauEffectif")})')
    verifier(i and i.get('reessais') is True, 'l\'oie : « 🔁 Recommencer » à la fin du mini-jeu (essais infinis)')
    verifier(('Ma belle' in voile(pg)) if A else ('trop rapide' in voile(pg)), 'l\'oie : le bon texte (attrapée / ratée)')
    if not A:
        # l'oie se recommence à l'infini (Romain, 12 novembre, 12 h 54) : le message d'échec, puis la boulangerie
        b = pg.locator('#voile .b-reessai')
        verifier(b.count() == 1 and 'dernière chance' not in b.inner_text(), 'l\'oie ratée : « 🔁 Réessayer », sans « dernière chance »')
        b.click(); pg.wait_for_timeout(900)
        verifier(pg.locator('#mj-plein .mj-go').count() == 1, 'l\'oie : on la recommence (2e essai)')
        pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(2600)
        pg.evaluate("() => window.__finir(false)"); pg.wait_for_timeout(500)
        verifier(pg.locator('#voile .b-reessai').count() == 1, 'l\'oie ratée deux fois : toujours « 🔁 Réessayer »')
        fermer(pg)
        lieu(pg, 'boulangerie')
        t = pg.evaluate("() => (document.querySelector('#voile [data-act=point][data-id=oie]') || {}).innerText || ''")
        verifier('réessayer' in t and 'fini' not in t, f'la boulangerie : l\'oie à réessayer, pas « fini » ({t!r})')
        pg.locator('#voile [data-act=point][data-id=oie]').click(); pg.wait_for_timeout(300)
        verifier(pg.locator('#voile [data-act=mj-go]').count() == 1, 'l\'oie : le point se rouvre depuis la boulangerie (3e essai)')
    fermer(pg)
    verifier(lieu(pg, 'potager') == [], 'le potager : plus rien pour le Pisteur (12 novembre : le gui est au Vieux verger, l\'Alchimiste le cueille elle-même, Bible §13.26)')
    fermer(pg)
    for l in ['clocher', 'mairie', 'puits']:
        verifier(lieu(pg, l) == [], f'{l}, le matin : rien pour le Pisteur'); fermer(pg)
    m = pg.evaluate("() => (M.etapesMission() || []).map(function(x){ return !!(x.fait && x.fait.some(M.condMission)); })")
    print('   missions :', m)

    # ---------- l'après-midi ----------
    print(' après-midi')
    verifier(code(pg, 'moment:1') and pg.evaluate("() => M.momentId() === 'apresmidi'"), 'le code de l\'après-midi')
    verifier(lieu(pg, 'place') == [], 'la place, l\'après-midi : rien (les traces partent de chez Odette)')
    fermer(pg)
    # LES TRACES DE MOUSTACHE (13 novembre) : devant chez Odette (L2), avec le code du Barde ; le nouveau mini-jeu « pistage » ;
    # autant d'essais qu'on veut ; plus de code « six doigts »
    verifier(lieu(pg, 'L2') == [] and pg.evaluate("() => Object.keys(M.bullesMaisons()).length") == 0, 'chez Odette, sans le code du Barde : rien, et pas de bulle sur sa maison')
    fermer(pg)
    verifier(code(pg, 'info:traces_moustache'), 'le code « Les traces de Moustache » (du Barde)')
    verifier(pg.evaluate("() => !M.E().infos.six_doigts"), 'plus de code « Moustache a six doigts »')
    verifier(pg.evaluate("() => M.bullesMaisons().L2") == '🐾', 'une petite bulle 🐾 se pose sur la maison d\'Odette')
    pts = lieu(pg, 'L2')
    verifier([p['id'] for p in pts] == ['traces'] and pts[0]['off'] is False, f'chez Odette : les traces de Moustache, sans « Explorer » avant ({pts})')
    i = jouer_point(pg, 'L2', 'traces', not A, f'{chemin}-traces')
    pp = (i or {}).get('params', {})
    verifier(i and i['type'] == 'pistage' and i.get('reessais') is True, f'les traces : le mini-jeu « Suivre les traces », à recommencer autant qu\'on veut ({i and i["type"]})')
    print('   niveau des traces : rang', pp.get('niveau'), '→ joué au niveau', pp.get('niveauEffectif'), '·', pp.get('faux'), 'fausses pistes · cinq doigts :', pp.get('cinq'))
    verifier(pp.get('faux') == (4 if A else 3) and bool(pp.get('cinq')) == A, 'adulte : quatre fausses pistes, dont Noisette et ses cinq doigts ; enfant : trois, sans Noisette')
    if A:
        # raté : pas de code, « Réessayer » ; puis réussi
        t = voile(pg)
        verifier('pas Moustache' in t and pg.locator('#voile .b-donne').count() == 0 and pg.locator('#voile .b-reessai').count() == 1, 'les traces ratées : « Ce n\'était pas Moustache », pas de code, « 🔁 Réessayer »')
        pg.locator('#voile .b-reessai').click(); pg.wait_for_timeout(900)
        pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(2600)
        pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(500)
    t = voile(pg)
    verifier('entrée de la crypte' in t and 'fermée à clé' in t, 'les traces réussies : « … à l\'entrée de la crypte. Mais sa grille est fermée à clé ! »')
    verifier(pg.locator('#voile .b-donne').count() == 1 and 'Anselme' in t and 'Barde' in t, 'le code « La crypte est fermée » : « Anselme, le sonneur de cloches, pourra peut-être vous aider. Donne ce code au Barde. »')
    fermer(pg)
    verifier(pg.evaluate("() => Object.keys(M.bullesMaisons()).length") == 0, 'la bulle 🐾 s\'en va')
    # LA MAIRIE (13 novembre) : sans le code du Barde, seulement « rendre sa mission » ; la lettre en cachette n'apparaît qu'avec
    # « La lettre est sur le bureau du maire » (le Barde a raté son grand dialogue) : niveau 5, autant d'essais qu'on veut
    pts = lieu(pg, 'mairie')
    verifier([p['id'] for p in pts] == ['mission'], f'la mairie, sans le code du Barde : rendre sa mission, rien d\'autre ({pts})')
    fermer(pg)
    verifier(code(pg, 'info:lettre_bureau'), 'le code « La lettre est sur le bureau du maire » (du Barde, quand il a raté)')
    pts = lieu(pg, 'mairie')
    verifier([p['id'] for p in pts] == ['lettre', 'mission'], f'la mairie, avec le code : la lettre en cachette, rendre sa mission ({pts})')
    i = jouer_point(pg, 'mairie', 'lettre', True, f'{chemin}-lettre')
    verifier(i and i['type'] == 'cachette' and i['params'].get('decor') == 'mairie' and i['params'].get('niveauEffectif') == 5 and i.get('reessais') is True, 'la lettre : se cacher, dans la mairie, niveau 5, essais infinis')
    verifier('grand rideau' in voile(pg) and pg.locator('#voile .b-donne').count() == 1, 'la lettre : le rideau, et le code pour le Sage et l\'Alchimiste')
    fermer(pg)
    lieu(pg, 'mairie')
    pg.locator('#voile [data-act=point][data-id=mission]').click(); pg.wait_for_timeout(300)
    t = voile(pg)
    verifier(('Des banderoles, une oie' in t) if A else ('pas d\'oie' in t), 'rendre la mission : le maire dit ce qui a été fait')
    verifier(pg.evaluate("() => M.S.or") >= or0 + 5, 'rendre la mission : de l\'or')
    fermer(pg)
    m = pg.evaluate("() => (M.etapesMission() || []).map(function(x){ return !!(x.fait && x.fait.some(M.condMission)); })")
    print('   missions :', m)

    # ---------- la nuit ----------
    print(' nuit')
    verifier(code(pg, 'moment:2') and pg.evaluate("() => M.momentId() === 'nuit'"), 'le code de la nuit')
    verifier(lieu(pg, 'clocher') == [], 'le clocher sans « La clé est au clou » : rien'); fermer(pg)
    verifier(lieu(pg, 'puits') == [], 'le puits, au début de la nuit : rien'); fermer(pg)
    verifier(code(pg, 'info:cle_clou'), 'le code « La clé est au clou » (du Barde)')
    pts = lieu(pg, 'clocher')
    verifier([p['id'] for p in pts] == ['cle'], 'le clocher : la clé d\'Anselme')
    i = jouer_point(pg, 'clocher', 'cle', A, f'{chemin}-cle')
    verifier(i and i['type'] == 'cachette' and i['params'].get('decor') == 'clocher', 'la clé : se cacher, dans le clocher')
    ne = (i or {}).get('params', {}).get('niveauEffectif')
    print('   niveau de la clé : rang', (i or {}).get('params', {}).get('niveau'), '→ joué au niveau', ne)
    verifier(ne is not None and 8 <= ne <= 10, f'la clé : niveau 8 à 10 ({ne})')
    t = voile(pg)
    if A:
        verifier('Tu la décroches' in t, 'la clé réussie : « Tu la décroches. »'); fermer(pg)
        pts = lieu(pg, 'clocher')
        verifier([p['id'] for p in pts] == ['cle', 'crypte'], 'le clocher : la grille de la crypte apparaît')
        pg.locator('#voile [data-act=point][data-id=crypte]').click(); pg.wait_for_timeout(300)
        # (13 novembre) la grille est déverrouillée : reste à l'ouvrir — tirer, pousser ou soulever (le détail : e3-descente.py)
        verifier('déverrouillée' in voile(pg) and pg.locator('#voile .b-choix-point [data-id=soulever]').count() == 1, 'la grille de la crypte est déverrouillée : trois gestes pour l\'ouvrir'); pg.screenshot(path=f'{OUT}/{chemin}-crypte.png'); fermer(pg)
        verifier(lieu(pg, 'puits') == [], 'la clé prise : jamais de puits'); fermer(pg)
        verifier(code(pg, 'info:vieux_puits') and lieu(pg, 'puits') == [], 'même avec « Le vieux puits » : pas de puits'); fermer(pg)
    else:
        verifier('vieux puits' in t, 'la clé ratée : Moustache file vers le vieux puits'); fermer(pg)
        pts = lieu(pg, 'clocher')
        verifier([p['id'] for p in pts] == ['cle'] and pts[0]['off'] is False, 'le clocher : pas de crypte')
        fermer(pg)
        pts = lieu(pg, 'puits')
        verifier([p['id'] for p in pts] == ['grille'], 'le puits apparaît')
        pg.locator('#voile [data-act=point][data-id=grille]').click(); pg.wait_for_timeout(300)
        verifier('toi, non' in voile(pg), 'la grille du puits : « Moustache passe… toi, non. »'); pg.screenshot(path=f'{OUT}/{chemin}-puits.png'); fermer(pg)
    m = pg.evaluate("() => (M.etapesMission() || []).map(function(x){ return [x.t, !!(x.fait && x.fait.some(M.condMission))]; })")
    print('   missions :', m)
    verifier(all(x[1] for x in m[:3]), 'les trois missions du Pisteur sont cochées')
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carnet'; M.render(); }"); pg.wait_for_timeout(300)
    pg.screenshot(path=f'{OUT}/{chemin}-carnet.png')
    pg.context.close()

with sync_playwright() as p:
    b = p.chromium.launch()
    partie(b, 'adulte', 'A')
    partie(b, 'enfant', 'B')
    b.close()
print('\nErreurs JS :', len(erreurs))
for e in erreurs[:12]: print('  ', e[:300])
print('Vérifications ratées :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if erreurs or echecs else 0)
