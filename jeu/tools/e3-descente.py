"""Enquête 3, étape 6 (Bible § 13.14) : la descente dans le donjon, branchée dans l'enquête (Playwright).

Première partie — l'enquête seule (le donjon n'est pas à côté : window.BRUMEVAL_SANS_DONJON, on note seulement où on allait) :
  le Pisteur A (la clé d'Anselme prise) : la grille de la crypte et son bouton « 🕯️ Descendre » ; sans le sac : « Il te manque le sac »
    et le bouton jaune vers l'onglet Code ; le code du sac ; la fenêtre de la descente (les fioles, le 🔊, le bouton jaune) ; l'adresse
    (la page du Pisteur, le jeton, les potions, l'entrée) ; une vieille partie du donjon (un autre jeton) ne compte pas ; la porte aux
    quatre signes : le code pour le Sage ; le donjon fini : « Léo attrapé » pour le Barde, la mission cochée ;
  le Pisteur B (la clé ratée) : le puits, la grille, l'acide (rien sans le sac, rien sans la fiole d'acide), l'entrée « puits » ;
    le maire pas retenu : « Léo s'est enfui » ;
  un code qui sert DANS le donjon (la Grosse Marie), tapé dans l'enquête : « Ce code-là se tape dans le donjon » ;
  le Sage : la page « Le plan des souterrains » (la nuit seulement), son bouton jaune, sa page du donjon ; le code de la porte tapé sur
    son plan arrive tout seul dans l'enquête (et pas avec un autre jeton) ; la page « La porte des Fondateurs » ;
  l'Alchimiste : « 🫕 Le chaudron du donjon » dans son sac, la nuit seulement ;
  les codes partagés ont les mêmes symboles que dans le donjon, et aucun code de l'enquête 3 n'est en double.
Deuxième partie — le vrai aller-retour (si le donjon construit est là : jeu/donjon/moteur/sortie, ou BRUMEVAL_DONJON=<dossier>) :
  un petit serveur sert le jeu et, à côté, donjon/ ; le Pisteur descend pour de vrai (ses potions, « Sous le clocher », le bouton
  « 🏘️ L'enquête »), remonte (on revient DANS l'enquête, pas au village), redescend (la partie est gardée), finit, et remonte : les codes.
  Le Sage et l'Alchimiste ouvrent leur page (le petit bouton 🏘️ ramène à l'enquête).
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-descente.py"""
import sys, os, json, threading, tempfile, shutil, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import etabli_outils as ET
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist'))
DONJON = os.path.abspath(os.environ.get('BRUMEVAL_DONJON') or os.path.join(ICI, '..', 'donjon', 'moteur', 'sortie'))
URL = 'file://' + os.path.join(DIST, 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-descente'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(400); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e && !e.hidden ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle, garder=False):
    """Taper un code comme un joueur : l'onglet Code, les trois symboles. Renvoie le texte de la fenêtre qui s'ouvre."""
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(350)
    t = texte(pg)
    if not garder: fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    return t

def lieu(pg, l):
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'carte'; M.render(); }")
    ev(pg, 'lieu', {'id': l})
    b = pg.locator('#voile [data-act=explorer]')
    if b.count(): b.first.click(); pg.wait_for_timeout(200)
    return pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .b-point[data-act=point]'), function(b){ return b.dataset.id; })")

def point(pg, pid):
    pg.locator(f'#voile [data-act=point][data-id={pid}]').first.click(); pg.wait_for_timeout(300)

def sans_son(pg, sel='#voile'):
    """les textes de plus de trois mots qui n'ont pas leur bouton 🔊 (dans sel)"""
    return pg.evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p'), function(p){
        if(p.classList.contains('doux')) return;
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var a = p.querySelector('.b-lire') || (p.nextElementSibling && p.nextElementSibling.classList.contains('b-lire') ? p.nextElementSibling : null);
        if(mots > 3 && !a) r.push(t.slice(0, 50)); });
      return r; }""", sel)

def jaune(pg, sel):
    """le bouton est jaune, son texte est noir (la règle des boutons « aller / lancer »)"""
    c = pg.evaluate("(sel) => { var e = document.querySelector(sel); if(!e) return null; var s = getComputedStyle(e); return [s.backgroundColor, s.backgroundImage, s.color]; }", sel)
    if not c: return False
    def rvb(x):
        import re
        m = re.findall(r'[\d.]+', x); return [float(v) for v in m[:3]] if len(m) >= 3 else None
    fond = rvb(c[1]) if 'gradient' in (c[1] or '') else rvb(c[0]); txt = rvb(c[2])
    return bool(fond and txt and fond[0] > 200 and fond[1] > 150 and fond[2] < 140 and max(txt) < 90)

def missions(pg):
    return pg.evaluate("() => (M.etapesMission() || []).map(function(x){ return [x.t, !!(x.fait && x.fait.some(M.condMission))]; })")

def carnet_missions(pg):
    """les missions à cocher que le Carnet montre (dépliées)"""
    pg.evaluate("() => { M.UI.modal = null; M.majMission(); M.P().mission.plie = false; M.P().onglet = 'carnet'; M.render(); }"); pg.wait_for_timeout(250)
    n = pg.locator('.b-missions li:not(.libre):not(.piste)').count()
    pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")
    return n

def jeton(pg):
    return pg.evaluate("() => M.P().donjonJeton || ''")

def vers(pg):
    return pg.evaluate("() => window.__donjonVers || ''")

def preparer(pg):
    pg.evaluate("""() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; M.lireAuto = function(){};
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

def debut(b, nom, role, url=None, sans_donjon=True):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text and 'sw.js' not in m.text and 'fetching the script' not in m.text else None)   # (le petit serveur d'essai n'a pas de sw.js)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;" + (" window.BRUMEVAL_SANS_DONJON = true;" if sans_donjon else ""))
    pg.goto(url or URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    preparer(pg)
    return pg

def cle_anselme(pg, reussi):
    """la nuit, au clocher : la clé d'Anselme (se cacher), réussie ou ratée"""
    code(pg, 'info:cle_clou')
    lieu(pg, 'clocher'); point(pg, 'cle')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(1500)
    pg.evaluate(f"() => window.__finir({'true' if reussi else 'false'})"); pg.wait_for_timeout(600)
    fermer(pg)

def donjon_ecrit(pg, cle, valeur):
    pg.evaluate("([k, v]) => localStorage.setItem(k, typeof v === 'string' ? v : JSON.stringify(v))", [cle, valeur])

def rendre(pg, ms=700):
    pg.evaluate("() => M.render()"); pg.wait_for_timeout(ms)


def partie_enquete(b):
    # ======================================================================== le Pisteur, par la crypte
    print('— Le Pisteur A : la crypte')
    pg = debut(b, 'Pisteur', 'pisteur')
    verifier(pg.evaluate("() => M.donjonDispo() && !!M.E().donjon"), 'enquête 3 : le donjon est branché')
    m = missions(pg)
    # (13 novembre, Romain : « les missions de la nuit sont trop grillées ») plus de mission du sac ni du donjon : on les découvre en jouant
    verifier(not any('donjon' in x[0] or 'potions' in x[0] for x in m), f'le Carnet du Pisteur : ses missions du jour, rien sur la nuit ({len(m)})')
    verifier(carnet_missions(pg) == 3, f'le matin, son Carnet ne montre que ses trois missions du jour ({carnet_missions(pg)}) : celles de la nuit n\'y sont pas encore')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    verifier(carnet_missions(pg) == 3, f'la nuit, aucune mission de plus dans son Carnet ({carnet_missions(pg)})')
    cle_anselme(pg, True)
    pts = lieu(pg, 'clocher')
    verifier(pts == ['cle', 'crypte'], f'le clocher : la grille de la crypte, pas encore de descente ({pts})')
    point(pg, 'crypte')
    t = texte(pg)
    verifier('escalier de pierre' in t and pg.locator('#voile .b-choix-point [data-act=point][data-id=descendre]').count() == 1 and 'Descendre' in t, 'la grille s\'ouvre : le bouton « 🕯️ Descendre »')
    verifier(jaune(pg, '#voile .b-choix-point [data-id=descendre]'), 'ce bouton est jaune, texte noir')
    shot(pg, 'crypte')
    point(pg, 'descendre')
    t = texte(pg)
    verifier('Il te manque le sac' in t and pg.locator('#voile [data-act=ds-code]').count() == 1 and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'sans le sac de l\'Alchimiste : « Il te manque le sac », pas de descente')
    verifier(not sans_son(pg) and jaune(pg, '#voile [data-act=ds-code]'), f'cette fenêtre : le 🔊, et un bouton jaune ({sans_son(pg)})')
    shot(pg, 'sans-sac')
    pg.locator('#voile [data-act=ds-code]').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.P().onglet") == 'code' and pg.evaluate("() => !M.UI.modal"), 'le bouton jaune emmène à l\'onglet Code')
    verifier(pg.evaluate("() => M.P().vus['donjon:entree']") == 'crypte', 'l\'entrée est retenue : la crypte')
    pts = lieu(pg, 'clocher')
    verifier(pts == ['cle', 'crypte', 'descendre'], f'le clocher : « Descendre sous le clocher » reste là ({pts})')
    t = code(pg, 'sac:5', True)   # (feu + huile : 1 + 4)
    verifier('2 potions' in t and pg.evaluate("() => (M.P().sac || []).join(',')") == 'feu,huile', f'le code du sac : deux potions, feu et huile ({t[:50]})')
    fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre')
    t = texte(pg)
    verifier('Descendre dans le donjon' in t and '2 potions' in t and pg.locator('#voile .pl-fiole.pl-pleine').count() == 2 and pg.locator('#voile .pl-fiole').count() == 7, 'la fenêtre de la descente : le sac, deux fioles pleines sur sept')
    verifier(not sans_son(pg) and jaune(pg, '#voile [data-act=ds-aller]'), f'elle a son 🔊 et son bouton jaune « 🕯️ Descendre » ({sans_son(pg)})')
    shot(pg, 'descente')
    pg.locator('#voile .b-lire').first.click(); pg.wait_for_timeout(150)
    verifier(pg.evaluate("() => window.__lus.length") == 1, 'le 🔊 lit la phrase (jamais de lecture toute seule)')
    pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier(u.startswith('donjon/index.html?') and 'enquete=3' in u and ('jeton=' + j) in u and len(j) > 8 and 'potions=feu,huile' in u and 'entree=crypte' in u, f'on part vers la page du Pisteur, avec le jeton, les potions et l\'entrée ({u})')
    verifier(pg.evaluate("() => !!M.P().vus['donjon:parti'] && !!M.P().vus['donjon:ouvert:pisteur']"), 'la descente est notée')
    lieu(pg, 'clocher'); point(pg, 'descendre')
    t = texte(pg)
    verifier('Retourner dans le donjon' in t and 'Y retourner' in t, 'ensuite : « Retourner dans le donjon »')
    fermer(pg)
    # une potion de plus : la même descente (le même jeton), le sac à jour
    code(pg, 'sac:21')   # (feu + huile + acide)
    lieu(pg, 'clocher'); point(pg, 'descendre'); pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    verifier(('jeton=' + j) in vers(pg) and 'potions=feu,huile,acide' in vers(pg), 'un nouveau sac (une potion de plus) : le même jeton, les trois potions')
    # une vieille partie du donjon, restée dans la tablette (un autre jeton) : elle ne compte pas
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': 'vieux', 'faits': {'fin': 1, 'code:porte:odette': 1, 'code:leo:attrape': 1}})
    rendre(pg)
    verifier(pg.evaluate("() => !M.P().vus['donjon:fini'] && !M.P().vus['donjon:porte'] && !M.UI.modal"), 'une vieille partie du donjon (un autre jeton) ne compte pas')
    # la porte aux quatre signes
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:porte:odette': 1}})
    rendre(pg)
    verifier(pg.evaluate("() => !!M.P().vus['donjon:porte'] && !!M.P().objets['_info:odette_porte'] && !M.P().vus['donjon:fini']"), 'la porte aux quatre signes est trouvée : le Pisteur garde le code pour le Sage')
    notes = pg.evaluate("() => M.P().carnet.map(function(x){ return x.t; }).join(' | ')")
    verifier('quatre signes' in notes, 'c\'est noté dans son Carnet')
    # le donjon fini, le maire retenu : Léo attrapé
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:porte:odette': 1, 'code:leo:attrape': 1, 'fin': 1}, 'codes': {'maire:retenu': 1}})
    rendre(pg, 900)
    t = texte(pg)
    verifier('Le donjon est fini' in t and 'coincé Léo' in t and pg.locator('#voile .b-donne').count() == 2, f'au retour : « Le donjon est fini », et deux codes à donner ({t[:60]})')
    verifier(not sans_son(pg), f'cette fenêtre a ses 🔊 ({sans_son(pg)})')
    shot(pg, 'fini')
    verifier(pg.evaluate("() => M.P().vus['donjon:leo']") == 'attrape' and pg.evaluate("() => !!M.P().objets['_info:leo_attrape'] && !M.P().objets['_info:leo_enfui']"), 'il garde le code « Léo attrapé » pour le Barde')
    fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre')
    verifier('Le donjon est fini' in texte(pg) and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'le donjon fini : on n\'y redescend plus, on retrouve ses codes')
    fermer(pg)
    # un code qui sert dans le donjon, tapé dans l'enquête
    t = code(pg, 'info:grosse_marie', True)
    verifier('dans le donjon' in t and not pg.evaluate("() => !!M.P().recus['info:grosse_marie']"), f'« La Grosse Marie » tapée dans l\'enquête : « ce code-là se tape dans le donjon » ({t[:50]})')
    fermer(pg)
    t = code(pg, 'info:maire_retenu', True)
    verifier('dans le donjon' in t, '« Le maire est retenu » : pareil')
    fermer(pg)
    # les codes : les mêmes symboles que dans le donjon, et aucun en double
    att = {'info:leo_attrape': 'etoile-arbre-flamme', 'info:leo_enfui': 'lune-flamme-chat', 'info:odette_porte': 'chapeau-lune-coeur', 'info:grosse_marie': 'cloche-cloche-lune', 'info:maire_retenu': 'chapeau-cle-chapeau'}
    vu = pg.evaluate("(l) => { var o = {}; l.forEach(function(k){ o[k] = M.code(k).join('-'); }); return o; }", list(att.keys()))
    verifier(vu == att, f'les cinq codes partagés ont les symboles du donjon ({vu})')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()), vus = {}, n = 0; Object.keys(c.parId).forEach(function(id){ var k = c.parId[id].join('-'); if(vus[k]) n++; vus[k] = 1; }); return n; }") == 0, 'aucun code de l\'enquête 3 n\'est en double (les codes du donjon compris)')
    pg.context.close()

    # ======================================================================== le Pisteur, par le puits
    print('— Le Pisteur B : le puits')
    pg = debut(b, 'Pisteur', 'pisteur')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    cle_anselme(pg, False)
    pts = lieu(pg, 'puits')
    verifier(pts == ['grille'], f'la clé ratée : le puits, sa grille ({pts})')
    point(pg, 'grille')
    verifier('ronger' in texte(pg), 'la grille : « Il faudrait de quoi ronger toute cette rouille ! »'); fermer(pg)
    pts = lieu(pg, 'puits')
    verifier(pts == ['grille', 'acide'], f'ensuite : « Verser l\'acide sur la grille » ({pts})')
    point(pg, 'acide')
    t = texte(pg)
    verifier('code de son sac' in t and not pg.evaluate("() => !!M.P().vus['pisteur:puits:acide']"), f'sans le sac : « L\'Alchimiste a ce qu\'il faut » ({t[:60]})')
    shot(pg, 'puits-sans-acide'); fermer(pg)
    code(pg, 'sac:5')   # (feu + huile : pas d'acide)
    lieu(pg, 'puits'); point(pg, 'acide')
    verifier(not pg.evaluate("() => !!M.P().vus['pisteur:puits:acide']"), 'un sac sans la fiole d\'acide : la grille tient bon'); fermer(pg)
    code(pg, 'sac:127')
    lieu(pg, 'puits'); point(pg, 'acide')
    t = texte(pg)
    verifier('Pssshhh' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1, 'avec l\'acide : « Pssshhh ! », et le bouton « 🕯️ Descendre »')
    shot(pg, 'puits-acide')
    point(pg, 'descendre')
    verifier('7 potions' in texte(pg) and pg.locator('#voile .pl-fiole.pl-pleine').count() == 7, 'la fenêtre de la descente : sept potions')
    pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier('entree=puits' in u and 'potions=feu,fumigene,huile,colle,acide,baume,coeur' in u, f'on part par le puits, avec les sept potions ({u[-90:]})')
    verifier(lieu(pg, 'clocher') == ['cle'], 'toujours pas de crypte au clocher'); fermer(pg)
    # le maire n'a pas été retenu : Léo s'est enfui
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:leo:enfui': 1, 'fin': 1}})
    rendre(pg, 900)
    t = texte(pg)
    verifier('Le donjon est fini' in t and 'filé dans le noir' in t and pg.locator('#voile .b-donne').count() == 1, f'le maire pas retenu, la porte pas trouvée : « il a filé dans le noir », un seul code ({t[:60]})')
    verifier(pg.evaluate("() => M.P().vus['donjon:leo']") == 'enfui' and pg.evaluate("() => !!M.P().objets['_info:leo_enfui'] && !M.P().objets['_info:leo_attrape']"), 'il garde le code « Léo s\'est enfui » pour le Barde')
    shot(pg, 'enfui')
    pg.context.close()

    # ======================================================================== le Sage
    print('— Le Sage : le plan des souterrains')
    pg = debut(b, 'Sage', 'sage')
    m = missions(pg)
    verifier(not any('souterrains' in x[0] or 'donjon' in x[0] for x in m), 'le Carnet du Sage : plus de mission de la nuit (13 novembre)')
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('donjon', true); }"); pg.wait_for_timeout(300)
    verifier(pg.locator('#livre-ici [data-act=ds-aller]').count() == 0, 'le matin : pas de plan des souterrains dans le Grand Livre')
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('donjon', true); }"); pg.wait_for_timeout(300)
    t = texte(pg, '#livre-ici .lv-page.on')
    verifier('souterrains' in t and 'voix haute' in t and pg.locator('#livre-ici .lv-page.on [data-act=ds-aller]').count() == 1, f'la nuit : la page « Le plan des souterrains » et son bouton ({t[:60]})')
    verifier(jaune(pg, '#livre-ici .lv-page.on [data-act=ds-aller]') and not sans_son(pg, '#livre-ici .lv-page.on'), 'ce bouton est jaune, et la page a son 🔊')
    shot(pg, 'sage-plan')
    pg.locator('#livre-ici .lv-page.on [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier(u.startswith('donjon/sage.html?') and ('jeton=' + j) in u and 'potions' not in u, f'on part vers la page du Sage ({u})')
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('porte', true); }"); pg.wait_for_timeout(300)
    t = texte(pg, '#livre-ici .lv-page.on')
    verifier('Le Pisteur la trouvera-t-il' in t and pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0, f'« La porte des Fondateurs » : fermée sans le code ({t[:50]})')
    # le code de la porte, tapé sur son plan (une autre descente : rien ; la sienne : il arrive tout seul)
    donjon_ecrit(pg, 'brumeval-donjon-sage', {'codes': {'porte:odette': True}}); donjon_ecrit(pg, 'brumeval-donjon-jeton:sage', 'vieux')
    rendre(pg)
    verifier(not pg.evaluate("() => !!M.P().recus['info:odette_porte']"), 'un code tapé sur le plan d\'une autre descente ne compte pas')
    donjon_ecrit(pg, 'brumeval-donjon-jeton:sage', j)
    rendre(pg, 900)
    t = texte(pg)
    verifier(pg.evaluate("() => !!M.P().recus['info:odette_porte']") and 'Odette est derrière la porte' in t, f'le code de la porte, tapé sur son plan, arrive tout seul dans l\'enquête ({t[:60]})')
    verifier(not sans_son(pg), 'cette fenêtre a son 🔊')
    shot(pg, 'sage-porte-recue'); fermer(pg)
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('porte', true); }"); pg.wait_for_timeout(300)
    verifier(pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=porte]').count() == 1, '« La porte des Fondateurs » peut s\'ouvrir')
    pg.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=porte]').click(); pg.wait_for_timeout(400); fermer(pg)
    pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('porte', true); }"); pg.wait_for_timeout(300)
    t = texte(pg, '#livre-ici .lv-page.on')
    verifier('Quatre signes' in t and 'ne s\'ouvrira pas cette nuit' in t and not sans_son(pg, '#livre-ici .lv-page.on'), f'la page : la porte aux quatre signes, Odette derrière ({t[:60]})')
    shot(pg, 'sage-porte')
    pg.context.close()
    # le Sage peut aussi taper le code à la main (le Pisteur le lui dicte)
    pg = debut(b, 'Sage2', 'sage')
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    t = code(pg, 'info:odette_porte', True)
    verifier(pg.evaluate("() => !!M.P().recus['info:odette_porte']") and 'Odette' in t, 'le Sage peut aussi taper le code de la porte dans l\'enquête')
    pg.context.close()

    # ======================================================================== l'Alchimiste
    print('— L\'Alchimiste : le chaudron du donjon')
    pg = debut(b, 'Alchi', 'alchimiste')
    pg.evaluate("() => { var P = M.P(); ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'].forEach(function(k){ P.vus['fiole:' + k] = 1; }); M.S.etabliIntro = 1; M.sauver(); }")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(900)
    ET.vite(pg); fr = ET.ouvrir(pg); ET.sac(pg)
    verifier(fr.locator('.carte [data-donjon]').count() == 0 and fr.locator('.carte .rang .pleine').count() == 7 and fr.locator('#sacCode').count() == 1, 'le jour, les sept potions faites : le code pour le Pisteur, mais pas de chaudron du donjon')
    ET.quitter(pg)
    code(pg, 'moment:1'); code(pg, 'moment:2')
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(900)
    fr = ET.ouvrir(pg); ET.sac(pg)
    t = fr.evaluate("() => { var c = document.querySelector('.carte'); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier(fr.locator('.carte [data-donjon]').count() == 1 and 'chaudron te suit' in t and fr.locator('#sacCode').count() == 1, f'la nuit, sur la carte des sept potions : le code pour le Pisteur, et « 🫕 Le chaudron du donjon » ({t[-80:]})')
    verifier(ET.sans_son(pg, '.carte') == [] and jaune(fr, '.carte [data-donjon]'), f'le 🔊 partout, et le bouton jaune ({ET.sans_son(pg, ".carte")})')
    shot(pg, 'alchimiste-sac')
    ET.toucher(pg, '.carte [data-donjon]', attendre=False); pg.wait_for_timeout(400)
    u = vers(pg)
    verifier(u.startswith('donjon/alchimiste.html?') and ('jeton=' + jeton(pg)) in u and pg.locator('#etabli-cadre').count() == 0, f'on part vers la page de l\'Alchimiste ({u})')
    pg.context.close()

    # ======================================================================== le Barde n'a pas de page du donjon
    print('— Le Barde')
    pg = debut(b, 'Barde', 'barde')
    verifier(pg.evaluate("() => M.donjonAdresse()") is None, 'le Barde n\'a pas de page du donjon : il fait la fête')
    pg.context.close()


class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass

def partie_vraie(b):
    """le vrai aller-retour : le jeu et, à côté, donjon/ (comme en ligne), servis par un petit serveur"""
    print('— Le vrai aller-retour (le donjon construit)')
    rac = tempfile.mkdtemp(prefix='brumeval-e3-')
    os.makedirs(os.path.join(rac, 'brumeval'))
    shutil.copy(os.path.join(DIST, 'index.html'), os.path.join(rac, 'brumeval', 'index.html'))
    os.symlink(DONJON, os.path.join(rac, 'brumeval', 'donjon'))
    srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Muet, directory=rac))
    threading.Thread(target=srv.serve_forever, daemon=True).start()
    base = f'http://127.0.0.1:{srv.server_address[1]}/brumeval/'
    try:
        # ---------- le Pisteur ----------
        pg = debut(b, 'Pisteur', 'pisteur', base + 'index.html#test', sans_donjon=False)
        code(pg, 'moment:1'); code(pg, 'moment:2')
        cle_anselme(pg, True)
        lieu(pg, 'clocher'); point(pg, 'crypte'); point(pg, 'descendre'); fermer(pg)
        code(pg, 'sac:5')
        lieu(pg, 'clocher'); point(pg, 'descendre')
        j = jeton(pg) or pg.evaluate("() => { M.donjonAdresse(); return M.P().donjonJeton; }")
        pg.locator('#voile [data-act=ds-aller]').click()
        pg.wait_for_url('**/donjon/index.html**'); pg.wait_for_timeout(1500)
        P = pg.evaluate("() => { var p = DJ.Explo._X().partie; return {enquete:p.enquete, jeton:p.jeton, entree:p.entree, recettes:p.recettes}; }")
        verifier(P['enquete'] == 3 and P['jeton'] == j and P['entree'] == 'crypte' and P['recettes'] == ['feu', 'huile'], f'le donjon s\'ouvre pour de vrai : une partie neuve, le jeton, la crypte, deux potions ({P})')
        t = pg.evaluate("() => document.querySelector('#conteur') ? document.querySelector('#conteur').textContent : ''")
        verifier('sac de l\'Alchimiste' in t and 'deux' in t.lower(), f'l\'écran du sac parle du sac de l\'Alchimiste ({t[:70]})')
        pg.screenshot(path=f'{OUT}/v1-donjon-sac.png')
        pg.eval_on_selector('[data-act=sac-pret]', 'e => e.click()')
        pg.wait_for_function("() => DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(600)
        t = pg.evaluate("() => document.querySelector('#conteur') ? document.querySelector('#conteur').textContent : ''")
        verifier('escalier de la crypte' in t, f'le fond du puits, en venant de la crypte : « L\'escalier de la crypte descend… » ({t[:60]})')
        pg.eval_on_selector('#b-repartir', 'e => e.click()')
        pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(500)
        verifier('Sous le clocher' in pg.inner_text('.titre-carte') and pg.locator('[data-act=enquete]').count() == 1, 'la carte : « Sous le clocher », et le bouton « 🏘️ L\'enquête »')
        pg.screenshot(path=f'{OUT}/v2-donjon-carte.png')
        # on remonte : on revient DANS l'enquête, la partie du donjon est gardée
        pg.eval_on_selector('[data-act=enquete]', 'e => e.click()')
        pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(900)
        verifier(pg.evaluate("() => M.UI.ecran") == 'enquete' and pg.evaluate("() => !M.P().vus['donjon:fini']"), 'on remonte : on revient dans l\'enquête (pas au village), rien n\'est fini')
        preparer(pg)
        lieu(pg, 'clocher'); point(pg, 'descendre')
        verifier('Retourner dans le donjon' in texte(pg), 'au clocher : « Retourner dans le donjon »')
        pg.locator('#voile [data-act=ds-aller]').click()
        pg.wait_for_url('**/donjon/index.html**'); pg.wait_for_timeout(1500)
        pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000)
        verifier(pg.evaluate("() => DJ.Explo._X().partie.jeton") == j and pg.locator('#sac').count() == 0, 'on redescend : la même partie, là où on l\'avait laissée (pas d\'écran du sac)')
        # les deux codes du Barde, dans le donjon (le pavé)
        def pave(cid):
            pg.eval_on_selector('[data-act=pave]', 'e => e.click()'); pg.wait_for_timeout(400)
            for s in pg.evaluate("(id) => DONJON_CODES.code(id)", cid):
                pg.eval_on_selector(f'#fenetre [data-act=symbole][data-id="{s}"]', 'e => e.click()'); pg.wait_for_timeout(300)
            pg.wait_for_timeout(900)
            return pg.inner_text('#fenetre') if pg.locator('#fenetre').count() else ''
        pg.evaluate("() => { var p = DJ.Explo._X().partie; p.heros.sage.pv = 1; p.heros.pisteur.pv = 2; }")
        t = pave('grosse:marie')
        pv = pg.evaluate("() => { var p = DJ.Explo._X().partie; return ['sage', 'alchimiste', 'pisteur'].every(function(h){ return p.heros[h].pv === p.heros[h].pvMax; }); }")
        verifier('Grosse Marie' in t and pv, f'« La Grosse Marie » tapée dans le donjon : toute la vie revient ({t[:50]})')
        pg.screenshot(path=f'{OUT}/v3-donjon-marie.png')
        pg.eval_on_selector('#fenetre [data-act=fermer]', 'e => e.click()'); pg.wait_for_timeout(400)
        t = pave('maire:retenu')
        verifier('Le maire est retenu' in t and pg.evaluate("() => !!DJ.Explo._X().partie.codes['maire:retenu']"), f'« Le maire est retenu » tapé dans le donjon ({t[:50]})')
        pg.eval_on_selector('#fenetre [data-act=fermer]', 'e => e.click()'); pg.wait_for_timeout(400)
        # la fin (on saute le chemin : les règles du donjon ont leurs propres tests) : la porte, puis Léo
        pg.evaluate("() => { var p = DJ.Explo._X().partie; Regles.entrer(p, 'porte4'); Regles.entrer(p, 'leo'); DJ.garder(p); }")
        f = pg.evaluate("() => DJ.Explo._X().partie.faits")
        verifier(f.get('fin') and f.get('code:leo:attrape') and not f.get('code:leo:enfui'), 'les règles : le maire retenu, Léo est attrapé')
        pg.eval_on_selector('[data-act=enquete]', 'e => e.click()')
        pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(1300)
        t = texte(pg)
        verifier('Le donjon est fini' in t and 'coincé Léo' in t and pg.locator('#voile .b-donne').count() == 2, f'on remonte : « Le donjon est fini », les deux codes ({t[:60]})')
        pg.screenshot(path=f'{OUT}/v4-retour-fini.png')
        pg.context.close()
        # ---------- le Sage ----------
        pg = debut(b, 'Sage', 'sage', base + 'index.html#test', sans_donjon=False)
        for _ in range(2):
            pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
        pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('donjon', true); }"); pg.wait_for_timeout(300)
        pg.locator('#livre-ici .lv-page.on [data-act=ds-aller]').click()
        pg.wait_for_url('**/donjon/sage.html**'); pg.wait_for_timeout(1500)
        j = pg.evaluate("() => localStorage.getItem('brumeval-donjon-jeton:sage')")
        verifier(bool(j) and pg.locator('#b-enquete').count() == 1, f'la page du Sage s\'ouvre pour de vrai, avec son jeton et le petit bouton 🏘️ ({j})')
        pg.screenshot(path=f'{OUT}/v5-sage.png')
        pg.evaluate("() => { var s = JSON.parse(localStorage.getItem('brumeval-donjon-sage') || '{}'); s.codes = s.codes || {}; s.codes['porte:odette'] = true; localStorage.setItem('brumeval-donjon-sage', JSON.stringify(s)); }")
        pg.eval_on_selector('#b-enquete', 'e => e.click()')
        pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(1300)
        verifier(pg.evaluate("() => M.UI.ecran") == 'enquete' and pg.evaluate("() => !!M.P().recus['info:odette_porte']") and 'Odette est derrière la porte' in texte(pg), 'le Sage revient dans l\'enquête : le code de la porte est arrivé tout seul')
        pg.context.close()
        # ---------- l'Alchimiste ----------
        pg = debut(b, 'Alchi', 'alchimiste', base + 'index.html#test', sans_donjon=False)
        pg.evaluate("() => { var P = M.P(); ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'].forEach(function(k){ P.vus['fiole:' + k] = 1; }); M.S.etabliIntro = 1; M.sauver(); }")
        code(pg, 'moment:1'); code(pg, 'moment:2')
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(900)
        ET.vite(pg); ET.ouvrir(pg); ET.sac(pg)
        ET.toucher(pg, '.carte [data-donjon]', attendre=False)
        pg.wait_for_url('**/donjon/alchimiste.html**'); pg.wait_for_timeout(1500)
        verifier(pg.locator('#b-enquete').count() == 1 and pg.evaluate("() => !!localStorage.getItem('brumeval-donjon-jeton:alchimiste')"), 'la page de l\'Alchimiste s\'ouvre pour de vrai, avec le petit bouton 🏘️')
        pg.screenshot(path=f'{OUT}/v6-alchimiste.png')
        pg.eval_on_selector('#b-enquete', 'e => e.click()')
        pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(900)
        verifier(pg.evaluate("() => M.UI.ecran") == 'enquete', 'l\'Alchimiste revient dans l\'enquête')
        pg.context.close()
    finally:
        srv.shutdown(); shutil.rmtree(rac, ignore_errors=True)


with sync_playwright() as p:
    b = p.chromium.launch()
    partie_enquete(b)
    if os.path.exists(os.path.join(DONJON, 'index.html')): partie_vraie(b)
    else: print('— (pas de donjon construit dans', DONJON, ': le vrai aller-retour n\'est pas joué)')
    b.close()

print()
if erreurs: print('ERREURS DE PAGE :'); [print('  ', e[:300]) for e in erreurs[:12]]
if echecs: print(f'{len(echecs)} ÉCHEC(S) :'); [print('  ✗', e) for e in echecs]
else: print('Tout est bon.')
sys.exit(1 if (echecs or erreurs) else 0)
