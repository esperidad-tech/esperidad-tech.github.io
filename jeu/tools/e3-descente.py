"""Enquête 3, étape 6 (Bible § 13.14 et § 13.34) : la descente dans le donjon, branchée dans l'enquête (Playwright).

Depuis le 13 novembre (le test de Romain) : la grille s'ouvre de trois façons (tirer, pousser : « un énorme bruit s'est entendu dans tout
le village » ; soulever : sans bruit) ; le Pisteur donne le code du départ, « On va dans la crypte », au Sage et à l'Alchimiste ; chacun
enfile sa tenue de combat et lui montre son code d'allure (celui de l'Alchimiste : seulement avec ses sept potions) ; les codes du donjon
du Sage et de l'Alchimiste se tapent dans l'enquête ; le plan, les pages de sauvegarde et le carnet de l'aventurier sont des pages du
Grand Livre ; la fleur de givre se prépare sur l'établi.

Première partie — l'enquête seule (le donjon n'est pas à côté : window.BRUMEVAL_SANS_DONJON, on note seulement où on allait) :
  le Pisteur A (la clé d'Anselme prise) : la grille, ses trois gestes, le code du départ ; la fenêtre de la tenue (les deux codes
    attendus, « on a besoin des sept potions pour descendre ») ; les deux codes d'allure ; la fenêtre de la descente (les trois héros, les
    sept fioles, le 🔊, le bouton jaune) ; l'adresse (le jeton, les potions, l'entrée, l'allure) ; une vieille partie du donjon ne compte
    pas ; la porte aux quatre signes ; l'homme en cape (le code pour le Barde) ; le donjon fini : « Léo a parlé », « Place aux
    accusations ! » (Bible §13.35) ; tirer et pousser : le bruit ;
  le Pisteur B (la clé ratée) : le puits, la grille, l'acide (rien sans le code de l'Alchimiste), l'entrée « puits » ; le donjon fini sans avoir trouvé la porte : un seul code ;
  un code qui sert DANS le donjon, tapé dans l'enquête par le Pisteur : « Ce code-là se tape dans le donjon » ;
  le Sage : le plan des souterrains (la nuit), qui s'ouvre dans le jeu ; le code du départ : sa tenue, son code, ses pages de sauvegarde
    (deux, écrire, barrer, une de plus) ; le carnet de l'aventurier ; la rune (« Une rune apparaît ! ») ; le morceau déchiré ; la porte ;
  l'Alchimiste : son code (celui des sept potions) ; la fleur de givre, de son code à la potion ; les herbes lumineuses (le chaudron) ;
  les codes partagés ont les mêmes symboles que dans le donjon, et aucun code de l'enquête 3 n'est en double.
Deuxième partie — le vrai aller-retour (si le donjon construit est là : jeu/donjon/moteur/sortie, ou BRUMEVAL_DONJON=<dossier>) :
  un petit serveur sert le jeu et, à côté, donjon/ ; le Pisteur descend pour de vrai (ses sept potions, l'allure des trois héros,
  « Sous le clocher », le bouton « 🏘️ L'enquête »), remonte, redescend, finit, et remonte : les codes. Le Sage voit son héros en tenue
  et ouvre son plan DANS le jeu (la rune y apparaît) ; l'Alchimiste envoie ses herbes lumineuses au chaudron du donjon.
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


def allure(pg, role, sexe='f', peau='p5', cheveux='noir'):
    """le code d'allure d'un équipier (comme il s'affiche chez lui), vu depuis cette tablette"""
    return pg.evaluate("([r, a]) => 'allure:' + M.allureNumero(r, a)", [role, {'sexe': sexe, 'peau': peau, 'cheveux': cheveux}])

def tenue_prete(pg, attente=20000):
    """la petite page de la tenue (un cadre dans la fenêtre) : on attend que ses héros soient là ; rend « qui » (ou '')"""
    for _ in range(int(attente / 250)):
        for f in pg.frames:
            if 'tenue.html' in f.url:
                try:
                    q = f.evaluate("() => window.TENUE && TENUE.pret ? TENUE.qui.join(',') : ''")
                    if q: return q
                except Exception:
                    pass
        pg.wait_for_timeout(250)
    return ''

def ouvrir_grille(pg, geste='soulever'):
    lieu(pg, 'clocher'); point(pg, 'crypte'); point(pg, geste)

def partie_enquete(b):
    # ======================================================================== le Pisteur, par la crypte
    print('— Le Pisteur A : la crypte')
    pg = debut(b, 'Pisteur', 'pisteur')
    verifier(pg.evaluate("() => M.donjonDispo() && !!M.E().donjon"), 'enquête 3 : le donjon est branché')
    m = missions(pg)
    verifier(not any('donjon' in x[0] or 'potions' in x[0] for x in m), f'le Carnet du Pisteur : ses missions du jour, rien sur la nuit ({len(m)})')
    verifier(carnet_missions(pg) == 3, f'le matin, son Carnet ne montre que ses trois missions du jour ({carnet_missions(pg)})')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    cle_anselme(pg, True)
    pts = lieu(pg, 'clocher')
    verifier(pts == ['cle', 'crypte'], f'le clocher : la grille de la crypte, rien d\'autre ({pts})')
    point(pg, 'crypte')
    t = texte(pg)
    verifier('déverrouillée' in t and all(pg.locator(f'#voile .b-choix-point [data-act=point][data-id={g}]').count() == 1 for g in ('tirer', 'pousser', 'soulever')), f'la grille est déverrouillée : tirer, pousser ou soulever ({t[:70]})')
    verifier(all(jaune(pg, f'#voile .b-choix-point [data-id={g}]') for g in ('tirer', 'pousser', 'soulever')) and not sans_son(pg), 'trois boutons jaunes, et le 🔊')
    shot(pg, 'grille')
    point(pg, 'soulever')
    t = texte(pg)
    verifier('Le portail s\'ouvre sans bruit' in t and 'pénétrez dans la crypte' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1, f'soulever : « le portail s\'ouvre sans bruit, et vous pénétrez dans la crypte » ({t[:80]})')
    verifier(pg.locator('#voile .b-code').count() == 1 and 'tenue de combat' in t and 'au Sage et à l\'Alchimiste' in t and pg.evaluate("() => !!M.P().objets['_info:on_descend']"), 'le code du départ est donné : « On va dans la crypte », pour le Sage et l\'Alchimiste')
    verifier(not sans_son(pg) and jaune(pg, '#voile .b-choix-point [data-id=descendre]'), f'le 🔊, et le bouton jaune « 🕯️ Descendre » ({sans_son(pg)})')
    shot(pg, 'soulever')
    fermer(pg)
    pts = lieu(pg, 'clocher')
    verifier(pts == ['cle', 'crypte', 'soulever', 'descendre'], f'les deux autres gestes s\'en vont ({pts})')
    point(pg, 'descendre')
    t = texte(pg)
    verifier('Il est temps d\'enfiler notre tenue de combat' in t and 'Il te manque le code du Sage' in t and 'On a besoin des sept potions pour descendre' in t, f'la fenêtre de la tenue : les deux codes attendus ({t[:70]})')
    verifier(pg.locator('#voile [data-act=ds-aller]').count() == 0 and pg.locator('#voile [data-act=ds-code]').count() == 1 and pg.locator('#voile .b-code').count() == 1 and pg.locator('#voile .ds-tenue').count() == 1, 'pas de descente sans les deux codes ; le code du départ est rappelé ; le héros est en tenue')
    verifier(not sans_son(pg) and jaune(pg, '#voile [data-act=ds-code]'), f'cette fenêtre : le 🔊 partout, et un bouton jaune ({sans_son(pg)})')
    shot(pg, 'tenue-pisteur')
    pg.locator('#voile [data-act=ds-code]').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.P().onglet") == 'code' and pg.evaluate("() => !M.UI.modal"), 'le bouton jaune emmène à l\'onglet Code')
    verifier(pg.evaluate("() => M.P().vus['donjon:entree']") == 'crypte', 'l\'entrée est retenue : la crypte')
    cs, ca = allure(pg, 'sage', 'm', 'p6', 'blond'), allure(pg, 'alchimiste', 'f', 'p2', 'rose')
    t = code(pg, cs, True)
    verifier('Le Sage est prêt' in t and pg.evaluate("() => { var a = M.P().allures.sage; return a.sexe + a.peau + a.cheveux; }") == 'mp6blond' and not sans_son(pg), f'le code d\'allure du Sage : « Le Sage est prêt ! » ({t[:60]})')
    shot(pg, 'recu-sage'); fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre')
    t = texte(pg)
    verifier('Le Sage est prêt.' in t and 'On a besoin des sept potions' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'il manque encore l\'Alchimiste : « on a besoin des sept potions pour descendre »')
    t = code(pg, ca, True)
    verifier('L\'Alchimiste est prêt' in t and pg.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pg.locator('#voile [data-act=ds-voir]').count() == 1, f'le code de l\'Alchimiste : ses sept potions, et « Voir la descente » ({t[:60]})')
    verifier(pg.evaluate("() => (M.P().sac || []).join(',')") == 'feu,fumigene,huile,colle,acide,baume,coeur' and jaune(pg, '#voile [data-act=ds-voir]'), 'les sept potions sont dans son sac')
    pg.locator('#voile [data-act=ds-voir]').click(); pg.wait_for_timeout(300)
    t = texte(pg)
    verifier('Descendre dans le donjon' in t and pg.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pg.locator('#voile .ds-tenue').get_attribute('data-qui') == 'sage,alchimiste,pisteur', 'la fenêtre de la descente : les trois héros en tenue, les sept fioles')
    verifier(not sans_son(pg) and jaune(pg, '#voile [data-act=ds-aller]'), f'elle a son 🔊 et son bouton jaune « 🕯️ Descendre » ({sans_son(pg)})')
    shot(pg, 'descente')
    pg.locator('#voile .b-lire').first.click(); pg.wait_for_timeout(150)
    verifier(pg.evaluate("() => window.__lus.length") == 1, 'le 🔊 lit la phrase (jamais de lecture toute seule)')
    pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier(u.startswith('donjon/index.html?') and 'enquete=3' in u and ('jeton=' + j) in u and len(j) > 8 and 'potions=feu,fumigene,huile,colle,acide,baume,coeur' in u and 'entree=crypte' in u, f'on part vers la page du Pisteur, avec le jeton, les potions et l\'entrée ({u[:110]})')
    import urllib.parse
    look = urllib.parse.parse_qs(u.split('?')[1]).get('look', [''])[0]
    verifier(look.startswith('p:f.') and 's:m.p6.blond' in look and 'a:f.p2.rose' in look, f'et avec l\'allure des trois héros ({look})')
    verifier(pg.evaluate("() => !!M.P().vus['donjon:parti'] && !!M.P().vus['donjon:ouvert:pisteur']"), 'la descente est notée')
    lieu(pg, 'clocher'); point(pg, 'descendre')
    t = texte(pg)
    verifier('Retourner dans le donjon' in t and 'Y retourner' in t, 'ensuite : « Retourner dans le donjon »')
    fermer(pg)
    # une vieille partie du donjon, restée dans la tablette (un autre jeton) : elle ne compte pas
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': 'vieux', 'faits': {'fin': 1, 'code:porte:odette': 1, 'code:leo:battu': 1}})
    rendre(pg)
    verifier(pg.evaluate("() => !M.P().vus['donjon:fini'] && !M.P().vus['donjon:porte'] && !M.UI.modal"), 'une vieille partie du donjon (un autre jeton) ne compte pas')
    # la porte aux quatre signes
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:porte:odette': 1}})
    rendre(pg)
    verifier(pg.evaluate("() => !!M.P().vus['donjon:porte'] && !!M.P().objets['_info:odette_porte'] && !M.P().vus['donjon:fini']"), 'la porte aux quatre signes est trouvée : le Pisteur garde le code pour le Sage')
    notes = pg.evaluate("() => M.P().carnet.map(function(x){ return x.t; }).join(' | ')")
    verifier('quatre signes' in notes, 'c\'est noté dans son Carnet')
    # la dernière salle : l'homme en cape est là (le code pour le Barde) ; rien n'est fini
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:porte:odette': 1, 'code:leo:salle': 1}})
    rendre(pg)
    verifier(pg.evaluate("() => !!M.P().vus['donjon:leo_la'] && !!M.P().objets['_info:leo_la'] && !M.P().vus['donjon:fini'] && !M.P().objets['_info:leo_battu']"), 'dans la dernière salle : le Pisteur garde le code « L\'homme en cape est là ! » pour le Barde ; rien n\'est fini')
    notes = pg.evaluate("() => M.P().carnet.map(function(x){ return x.t; }).join(' | ')")
    verifier('cape noire' in notes and 'Léo' not in notes, 'c\'est noté dans son Carnet, sans le nom de Léo')
    # Léo battu : il a parlé
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:porte:odette': 1, 'code:leo:salle': 1, 'code:leo:battu': 1, 'combat:leo': 1, 'fin': 1}})
    rendre(pg, 900)
    t = texte(pg)
    verifier('Le donjon est fini' in t and 'Sous la cape noire : Léo' in t and 'Place aux accusations' in t and pg.locator('#voile .b-donne').count() == 2, f'au retour : « Le donjon est fini… Place aux accusations ! », et deux codes à donner ({t[:60]})')
    verifier(not sans_son(pg), f'cette fenêtre a ses 🔊 ({sans_son(pg)})')
    shot(pg, 'fini')
    verifier(pg.evaluate("() => M.P().vus['donjon:leo']") == 'battu' and pg.evaluate("() => !!M.P().objets['_info:leo_battu']"), 'il garde le code « Léo a parlé » pour le Sage')
    fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre')
    verifier('Le donjon est fini' in texte(pg) and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'le donjon fini : on n\'y redescend plus, on retrouve ses codes')
    fermer(pg)
    # des codes qui servent dans le donjon, tapés dans l'enquête par le Pisteur
    t = code(pg, 'info:grosse_marie', True)
    verifier('dans le donjon' in t and not pg.evaluate("() => !!M.P().recus['info:grosse_marie']"), f'« La Grosse Marie » tapée dans l\'enquête : « ce code-là se tape dans le donjon » ({t[:50]})')
    fermer(pg)
    t = code(pg, 'donjon:sauve:1', True)
    verifier('dans le donjon' in t, f'un sort de sauvegarde tapé dans l\'enquête : « dans le donjon » ({t[:50]})')
    fermer(pg)
    t = code(pg, 'donjon:rune:lumiere', True)
    verifier('pour le Sage' in t, f'un code du Sage tapé par le Pisteur : « pour le Sage » ({t[:60]})')
    fermer(pg)
    # les codes : les mêmes symboles que dans le donjon, et aucun en double
    att = {'info:leo_la': 'etoile-arbre-flamme', 'info:leo_battu': 'lune-flamme-chat', 'info:odette_porte': 'chapeau-lune-coeur', 'info:grosse_marie': 'cloche-cloche-lune'}
    vu = pg.evaluate("(l) => { var o = {}; l.forEach(function(k){ o[k] = M.code(k).join('-'); }); return o; }", list(att.keys()))
    verifier(vu == att, f'les quatre codes partagés ont les symboles du donjon ({vu})')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()), vus = {}, n = 0; Object.keys(c.parId).forEach(function(id){ var k = c.parId[id].join('-'); if(vus[k]) n++; vus[k] = 1; }); return n; }") == 0, 'aucun code de l\'enquête 3 n\'est en double (les codes du donjon et les 432 codes d\'allure compris)')
    verifier(pg.evaluate("() => { for(var n = 0; n < 432; n++){ var a = M.allureDe(n); if(M.allureNumero(a.role, a) !== n) return false; } return !!M.code('allure:431') && !M.code('allure:432') && !M.code('sac:5') && !M.code('info:maire_retenu') && !M.code('info:leo_attrape') && !M.code('info:leo_enfui'); }"), 'les 432 codes d\'allure se lisent et s\'écrivent ; plus de code du sac, du maire retenu, de « Léo attrapé / enfui »')
    pg.context.close()

    # ---------- tirer, pousser : le bruit
    for geste in ('tirer', 'pousser'):
        pg = debut(b, 'Pisteur', 'pisteur')
        code(pg, 'moment:1'); code(pg, 'moment:2')
        cle_anselme(pg, True)
        ouvrir_grille(pg, geste)
        t = texte(pg)
        verifier('Un énorme bruit s\'est entendu dans tout le village' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1 and pg.locator('#voile .b-code').count() == 1, f'{geste} : « un énorme bruit s\'est entendu dans tout le village », le code du départ, puis « Descendre » ({t[:60]})')
        verifier(pg.evaluate(f"() => M.P().vus['pisteur:clocher:{geste}'] === 'ok' && !M.P().vus['pisteur:clocher:soulever']") and not sans_son(pg), 'le bruit est retenu (pour la fin de l\'enquête)')
        if geste == 'tirer': shot(pg, 'tirer')
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
    verifier('sept potions' in t and 'son code' in t and not pg.evaluate("() => !!M.P().vus['pisteur:puits:acide']"), f'sans le code de l\'Alchimiste : « quand ses sept potions seront prêtes » ({t[:70]})')
    shot(pg, 'puits-sans-acide'); fermer(pg)
    code(pg, allure(pg, 'alchimiste'))
    lieu(pg, 'puits'); point(pg, 'acide')
    t = texte(pg)
    verifier('Pssshhh' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1 and pg.locator('#voile .b-code').count() == 1, 'avec le code de l\'Alchimiste : « Pssshhh ! », le code du départ, et « 🕯️ Descendre »')
    shot(pg, 'puits-acide')
    point(pg, 'descendre')
    t = texte(pg)
    verifier('Il te manque le code du Sage' in t and 'L\'Alchimiste est prêt' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'la fenêtre de la tenue : il manque le Sage')
    code(pg, allure(pg, 'sage'))
    lieu(pg, 'puits'); point(pg, 'descendre')
    verifier(pg.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pg.locator('#voile [data-act=ds-aller]').count() == 1, 'les deux codes tapés : la fenêtre de la descente, sept potions')
    pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier('entree=puits' in u and 'potions=feu,fumigene,huile,colle,acide,baume,coeur' in u, f'on part par le puits, avec les sept potions ({u[-120:]})')
    verifier(lieu(pg, 'clocher') == ['cle'], 'toujours pas de crypte au clocher'); fermer(pg)
    # le donjon fini sans avoir trouvé la porte aux quatre signes : un seul code
    donjon_ecrit(pg, 'brumeval-donjon-partie', {'v': 1, 'jeton': j, 'faits': {'code:leo:salle': 1, 'code:leo:battu': 1, 'combat:leo': 1, 'fin': 1}})
    rendre(pg, 900)
    t = texte(pg)
    verifier('Le donjon est fini' in t and 'Place aux accusations' in t and pg.locator('#voile .b-donne').count() == 1, f'le donjon fini, la porte pas trouvée : un seul code, « Léo a parlé » ({t[:60]})')
    verifier(pg.evaluate("() => M.P().vus['donjon:leo']") == 'battu' and pg.evaluate("() => !!M.P().objets['_info:leo_battu'] && !!M.P().objets['_info:leo_la'] && !M.P().objets['_info:odette_porte']"), 'il garde les deux codes de Léo (pour le Barde, pour le Sage)')
    shot(pg, 'fini-sans-porte')
    pg.context.close()

    # ======================================================================== le Sage
    print('— Le Sage : son Grand Livre du donjon')
    pg = debut(b, 'Sage', 'sage')
    def livre(pid):
        pg.evaluate("(p) => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller(p, true); }", pid); pg.wait_for_timeout(350)
        return texte(pg, '#livre-ici .lv-page.on')
    def pages():
        return pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); return [].map.call(document.querySelectorAll('#livre-ici .lv-page'), function(s){ return s.dataset.id; }); }")
    ACT = '#livre-ici .lv-page.on '
    m = missions(pg)
    verifier(not any('souterrains' in x[0] or 'donjon' in x[0] for x in m), 'le Carnet du Sage : plus de mission de la nuit (13 novembre)')
    livre('donjon')
    verifier(pg.locator(ACT + '[data-act=ds-plan]').count() == 0, 'le matin : pas de plan des souterrains à regarder')
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    t = livre('donjon')
    verifier('souterrains' in t and 'voix haute' in t and 'Il manque un coin' in t and pg.locator(ACT + '[data-act=ds-plan]').count() == 1, f'la nuit : la page « Le plan des souterrains » et son bouton ({t[:60]})')
    verifier(jaune(pg, ACT + '[data-act=ds-plan]') and not sans_son(pg, '#livre-ici .lv-page.on'), 'ce bouton est jaune, et la page a ses 🔊')
    shot(pg, 'sage-plan')
    pg.locator(ACT + '[data-act=ds-plan]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier(u.startswith('donjon/sage.html?') and ('jeton=' + j) in u and 'dans=jeu' in u and 'potions' not in u and pg.evaluate("() => !!M.S.e && M.UI.ecran === 'enquete'"), f'le plan s\'ouvre DANS le jeu : on ne quitte pas l\'enquête ({u})')
    l = pages()
    verifier('sauvegardes' not in l and 'aventurier' not in l and 'tenue' not in l, f'avant le départ : ni pages de sauvegarde, ni carnet, ni tenue ({l[-8:]})')
    # le code du départ : la tenue, son code, les pages de sauvegarde
    t = code(pg, 'info:on_descend', True)
    verifier('Il est temps d\'enfiler notre tenue de combat' in t and 'Montre ce code au Pisteur' in t and pg.locator('#voile .ds-moncode .b-code').count() == 1 and pg.locator('#voile .ds-tenue').count() == 1, f'« On va dans la crypte » : la tenue de combat, et son code pour le Pisteur ({t[:60]})')
    verifier(not sans_son(pg) and jaune(pg, '#voile .b-aller'), f'le 🔊 partout, et un bouton jaune ({sans_son(pg)})')
    moi = pg.evaluate("() => M.allureCode()")
    verifier(pg.evaluate("(id) => { var a = M.allureDe(+id.split(':')[1]), h = M.S.heros; return a.role === 'sage' && a.sexe === (h.sexe === 'm' ? 'm' : 'f') && a.peau === h.peau && a.cheveux === h.cheveux; }", moi), f'ce code dit bien son héros ({moi})')
    shot(pg, 'sage-tenue'); fermer(pg)
    t = code(pg, 'info:on_descend', True); verifier('Montre ce code au Pisteur' in t, 'le code retapé : la même fenêtre (il retrouve son code)'); fermer(pg)
    t = code(pg, moi, True); verifier('pour le Pisteur' in t, f'son propre code tapé chez lui : « pour le Pisteur » ({t[:50]})'); fermer(pg)
    l = pages()
    verifier('sauvegardes' in l and 'tenue' in l and l.index('tenue') < l.index('donjon') < l.index('sauvegardes'), f'ses pages : la tenue, le plan, les sauvegardes ({l[-9:]})')
    t = livre('tenue')
    verifier('Montre ce code au Pisteur' in t and not sans_son(pg, '#livre-ici .lv-page.on'), 'la page « Ma tenue de combat » garde son code')
    t = livre('sauvegardes')
    verifier(pg.locator(ACT + '.ds-page').count() == 2 and pg.locator(ACT + '.ds-blanche').count() == 2 and not sans_son(pg, '#livre-ici .lv-page.on'), f'les pages de sauvegarde : deux pages blanches ({t[:50]})')
    pg.locator(ACT + '.ds-blanche[data-n="1"]').click(); pg.wait_for_timeout(350)
    verifier(pg.locator(ACT + '.ds-ecrite .b-code').count() == 1 and pg.locator(ACT + '[data-act=ds-barrer]').count() == 1 and pg.evaluate("() => M.code('donjon:sauve:1').join('-')") == 'lune-cle-arbre', 'écrire le sort : son code apparaît (celui du donjon), avec « Le Pisteur l\'a tapé »')
    shot(pg, 'sage-sauvegardes')
    pg.locator(ACT + '[data-act=ds-barrer]').click(); pg.wait_for_timeout(350)
    verifier(pg.locator(ACT + '.ds-barree .ds-code-barre').count() == 1 and pg.locator(ACT + '.ds-blanche').count() == 1 and 'Sort utilisé' in texte(pg, '#livre-ici .lv-page.on'), 'le code utilisé est barré')
    t = code(pg, 'donjon:page:blanche', True)
    verifier('Une page blanche' in t and jaune(pg, '#voile [data-act=ds-livre]') and not sans_son(pg), f'le code « Une page blanche » ({t[:50]})')
    pg.locator('#voile [data-act=ds-livre]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'sauvegardes' and pg.locator(ACT + '.ds-page').count() == 3, 'une page de plus, et le livre s\'ouvre dessus')
    # le carnet de l'aventurier
    t = code(pg, 'donjon:etude:rat', True)
    verifier('Rat' in t and 'bonne page' in t and not sans_son(pg), f'un code d\'étude : la page du monstre ({t[:60]})'); fermer(pg)
    livre('aventurier')
    verifier(pg.locator(ACT + '.ds-bete').count() == 1, 'le carnet : une seule page, celle du rat')
    t = code(pg, 'donjon:carnet:aventurier', True)
    verifier('Un vieux carnet' in t and pg.evaluate("() => M.code('donjon:carnet:aventurier').join('-')") == 'chapeau-arbre-poisson' and not sans_son(pg), 'le code du carnet : chapeau, arbre, poisson')
    pg.locator('#voile [data-act=ds-livre]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'aventurier' and pg.locator(ACT + '.ds-bete').count() == 9 and not sans_son(pg, '#livre-ici .lv-page.on'), 'tout le carnet : neuf monstres')
    shot(pg, 'sage-carnet')
    pg.locator(ACT + '.ds-bete').nth(8).click(); pg.wait_for_timeout(350)
    t = texte(pg)
    verifier('Bourbe' in t and pg.locator('#voile .ds-recit .b-lire').count() >= 2 and not sans_son(pg), f'toucher un monstre : sa page, un 🔊 par paragraphe ({t[:40]})'); fermer(pg)
    # la rune, le morceau déchiré
    t = code(pg, 'donjon:rune:lumiere', True)
    verifier('Une rune apparaît' in t and jaune(pg, '#voile [data-act=ds-plan]') and not sans_son(pg), f'la rune : « Une rune apparaît ! », puis le plan ({t[:50]})')
    shot(pg, 'sage-rune')
    pg.locator('#voile [data-act=ds-plan]').click(); pg.wait_for_timeout(300)
    u = urllib.parse.parse_qs(vers(pg).split('?')[1])
    verifier(u.get('nouveau') == ['rune:lumiere'] and 'rune:lumiere' in u.get('codes', [''])[0].split(',') and u.get('dans') == ['jeu'], f'le plan s\'ouvre avec la rune ({u.get("codes")})')
    t = code(pg, 'donjon:page:dechiree', True)
    verifier('morceau' in t and pg.locator('#voile [data-act=ds-plan][data-nouveau="page:dechiree"]').count() == 1, 'le morceau déchiré du plan'); fermer(pg)
    t = livre('donjon')
    verifier('Le morceau déchiré est recollé' in t and 'rune de lumière' in t, 'la page du plan dit où on en est')
    # la porte : le Pisteur lui dicte le code
    t = livre('porte')
    verifier('Le Pisteur la trouvera-t-il' in t and pg.locator(ACT + '[data-act=ouvrir-page]').count() == 0, f'« La porte des Fondateurs » : fermée sans le code ({t[:50]})')
    t = code(pg, 'info:odette_porte', True)
    verifier(pg.evaluate("() => !!M.P().recus['info:odette_porte']") and 'Odette' in t, 'le code de la porte se tape dans l\'enquête'); fermer(pg)
    livre('porte')
    verifier(pg.locator(ACT + '[data-act=ouvrir-page][data-id=porte]').count() == 1, '« La porte des Fondateurs » peut s\'ouvrir')
    pg.locator(ACT + '[data-act=ouvrir-page][data-id=porte]').click(); pg.wait_for_timeout(400); fermer(pg)
    t = livre('porte')
    verifier('Quatre signes' in t and 'ne s\'ouvrira pas cette nuit' in t and not sans_son(pg, '#livre-ici .lv-page.on'), f'la page : la porte aux quatre signes, Odette derrière ({t[:60]})')
    pg.evaluate("() => { M.A['ds-plan']({dataset:{}}); }"); pg.wait_for_timeout(200)
    verifier('porte:odette' in urllib.parse.parse_qs(vers(pg).split('?')[1]).get('codes', [''])[0], 'le plan saura que la porte est trouvée')
    t = code(pg, 'donjon:plante:givre', True); verifier('Alchimiste' in t, f'la fleur de givre tapée par le Sage : « pour l\'Alchimiste » ({t[:60]})')
    pg.context.close()

    # ======================================================================== l'Alchimiste
    print('— L\'Alchimiste : son code, la fleur de givre')
    pg = debut(b, 'Alchi', 'alchimiste')
    pg.evaluate("() => { M.S.etabliIntro = 1; M.sauver(); }")
    ET.vite(pg)
    code(pg, 'moment:1'); code(pg, 'moment:2')
    t = code(pg, 'info:on_descend', True)
    verifier('Il est temps d\'enfiler notre tenue de combat' in t and 'Il t\'en manque 7' in t and 'On a besoin des sept potions pour descendre' in t and pg.locator('#voile .ds-moncode').count() == 0, f'sans ses potions : la tenue, mais pas de code ({t[:90]})')
    verifier(not sans_son(pg), 'le 🔊'); shot(pg, 'alchimiste-sans-potions'); fermer(pg)
    pg.evaluate("() => { var P = M.P(); ['feu', 'fumigene', 'huile', 'colle', 'acide', 'baume', 'coeur'].forEach(function(k){ P.vus['fiole:' + k] = 1; }); M.sauver(); }")
    t = code(pg, 'info:on_descend', True)
    verifier('sept potions à la ceinture' in t and pg.locator('#voile .ds-moncode .b-code').count() == 1, 'avec ses sept potions : son code pour le Pisteur')
    moi = pg.evaluate("() => M.allureCode()"); att = pg.evaluate("(id) => M.code(id).map(function(s){ return DONNEES.SYM[s].e; }).join('')", moi)
    fermer(pg)
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(900)
    fr = ET.ouvrir(pg); ET.sac(pg)
    verifier(fr.locator('.carte .rang .pleine').count() == 7 and fr.locator('#sacCode .formes').inner_text() == att and fr.locator('.carte [data-donjon]').count() == 0, f'l\'établi montre le même code, celui des sept potions ({att}) ; plus de chaudron du donjon')
    verifier(ET.sans_son(pg, '.carte') == [], 'le 🔊 partout')
    shot(pg, 'alchimiste-code')
    ET.quitter(pg)
    # la fleur de givre
    t = code(pg, 'donjon:plante:givre', True)
    verifier('fleur de givre' in t and jaune(pg, '#voile [data-act=ds-etabli]') and not sans_son(pg) and pg.evaluate("() => M.code('donjon:plante:givre').join('-')") == 'poisson-lune-etoile', f'le code de la fleur de givre ({t[:60]})')
    verifier(pg.evaluate("() => M.P().plantes.givre === 1 && M.plantesEnAttente() === 1 && M.potionsPretes().n === 7"), 'elle attend sur la tringle ; les sept potions restent sept')
    pg.locator('#voile [data-act=ds-etabli]').click(); pg.wait_for_timeout(300)
    fr = ET.ouvrir(pg)
    verifier(fr.evaluate("() => !!document.querySelector('#pendue-givre') && document.querySelector('#potion-givre').style.display !== 'none'"), 'l\'établi s\'ouvre : la fleur pend à la tringle, son flacon vide attend')
    R = ET.recettes(pg)
    ET.faire(pg, 'givre', R); pg.wait_for_timeout(1300)
    carte = fr.evaluate("() => { var c = document.querySelector('.carte.prete'); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('givre' in ET.etat(pg)['faites'] and len(R['RE']['givre']['etapes']) == 8, 'la potion de givre se fait, geste par geste : huit étapes')
    verifier('Donne ce code au Pisteur : ça peut être utile' in carte and 'Sept fioles' not in carte and fr.locator('#plusCode .formes').inner_text() == '🍄❤️🔑', f'sa carte : « Donne ce code au Pisteur : ça peut être utile ! », et le code de la recette ({carte[-90:]})')
    verifier(ET.sans_son(pg, '.carte') == [], 'le 🔊 partout')
    shot(pg, 'alchimiste-givre')
    ET.continuer(pg); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => !!M.P().vus['fiole:givre'] && M.potionsPretes().n === 7 && M.code('donjon:recette:givre').join('-') === 'champi-coeur-cle'"), 'le jeu a noté le givre ; les sept restent sept ; le code est celui du donjon')
    ET.quitter(pg)
    # les herbes lumineuses : en attendant la décision de Romain, l'ancien chaudron du donjon
    t = code(pg, 'donjon:plante:lumiere', True)
    verifier('herbes' in t and jaune(pg, '#voile [data-act=ds-chaudron]') and not sans_son(pg), f'les herbes lumineuses : le chaudron du donjon ({t[:60]})')
    pg.locator('#voile [data-act=ds-chaudron]').click(); pg.wait_for_timeout(300)
    u = vers(pg)
    verifier(u.startswith('donjon/alchimiste.html?') and ('jeton=' + jeton(pg)) in u and 'recu=plante%3Alumiere' in u, f'on part vers le chaudron du donjon, avec la plante ({u})')
    pg.context.close()

    # ======================================================================== le Barde n'a pas de page du donjon
    print('— Le Barde')
    pg = debut(b, 'Barde', 'barde')
    verifier(pg.evaluate("() => M.donjonAdresse()") is None, 'le Barde n\'a pas de page du donjon : il fait la fête')
    t = code(pg, 'info:on_descend', True)
    verifier('équipier' in t and not pg.evaluate("() => !!M.P().recus['info:on_descend']"), f'le code du départ n\'est pas pour lui ({t[:60]})')
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
        ouvrir_grille(pg, 'soulever'); fermer(pg)
        lieu(pg, 'clocher'); point(pg, 'descendre'); pg.wait_for_timeout(600)
        verifier(pg.locator('#voile iframe.ds-tenue').count() == 1 and tenue_prete(pg) == 'pisteur', 'la fenêtre de la tenue montre pour de vrai le Pisteur en tenue de combat (la petite page du donjon)')
        pg.screenshot(path=f'{OUT}/v0-tenue-pisteur.png')
        fermer(pg)
        code(pg, allure(pg, 'sage', 'm', 'p6', 'blond')); code(pg, allure(pg, 'alchimiste', 'f', 'p2', 'rose'))
        lieu(pg, 'clocher'); point(pg, 'descendre'); pg.wait_for_timeout(400)
        verifier(tenue_prete(pg) == 'sage,alchimiste,pisteur', 'la fenêtre de la descente montre les trois héros en tenue')
        pg.screenshot(path=f'{OUT}/v0-descente-trois.png')
        j = jeton(pg) or pg.evaluate("() => { M.donjonAdresse(); return M.P().donjonJeton; }")
        pg.locator('#voile [data-act=ds-aller]').click()
        pg.wait_for_url('**/donjon/index.html**'); pg.wait_for_timeout(1500)
        P = pg.evaluate("() => { var p = DJ.Explo._X().partie; return {enquete:p.enquete, jeton:p.jeton, entree:p.entree, recettes:p.recettes, look:p.look}; }")
        verifier(P['enquete'] == 3 and P['jeton'] == j and P['entree'] == 'crypte' and len(P['recettes']) == 7, f'le donjon s\'ouvre pour de vrai : une partie neuve, le jeton, la crypte, sept potions ({P["recettes"]})')
        L = pg.evaluate("() => { var A = DonjonAllure, L = DJ.LOOK; return {sage:[L.sage.fille, L.sage.pe === A.PE.p6, L.sage.ch === A.CH.blond, !!L.sage.lunettes], alchimiste:[L.alchimiste.fille, L.alchimiste.pe === A.PE.p2, L.alchimiste.ch === A.CH.rose], pisteur:[L.pisteur.fille, !!L.pisteur.pe]}; }")
        verifier(L['sage'] == [False, True, True, True] and L['alchimiste'] == [True, True, True] and 's:m.p6.blond' in (P['look'] or ''), f'les trois héros ont l\'allure des joueurs ({P["look"]})')
        pg.wait_for_timeout(1200)
        verifier(pg.evaluate("() => { var st = document.querySelector('#dj-css-heros-look'); return !!st && (st.textContent.match(/data:image\\/png/g) || []).length; }") == 3, 'leurs petites têtes sont refaites à leur allure (trois photos)')
        t = pg.evaluate("() => document.querySelector('#conteur') ? document.querySelector('#conteur').textContent : ''")
        verifier('sac de l\'Alchimiste' in t, f'l\'écran du sac parle du sac de l\'Alchimiste ({t[:70]})')
        pg.screenshot(path=f'{OUT}/v1-donjon-sac.png')
        pg.eval_on_selector('[data-act=sac-pret]', 'e => e.click()')
        pg.wait_for_function("() => DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(600)
        verifier(pg.evaluate("() => { var c = document.querySelector('#conteur'); return !c || getComputedStyle(c).visibility === 'hidden' || !c.offsetHeight; }"), 'l\'entrée des souterrains : plus de bandeau d\'explications (Romain, 13 novembre)')
        pg.screenshot(path=f'{OUT}/v1b-donjon-heros.png')
        pg.eval_on_selector('#b-repartir', 'e => e.click()')
        pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(500)
        verifier('Les souterrains' in pg.inner_text('.titre-carte') and pg.locator('[data-act=enquete]').count() == 1, 'la carte : « Les souterrains », et le bouton « 🏘️ L\'enquête »')
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
        verifier(pg.evaluate("() => DJ.Explo._X().partie.jeton") == j and pg.locator('#sac').count() == 0 and pg.evaluate("() => DJ.LOOK.sage.fille") is False, 'on redescend : la même partie, là où on l\'avait laissée, les mêmes héros')
        # les deux codes du Barde, et le code du givre de l'Alchimiste, dans le donjon (le pavé)
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
        verifier(pg.evaluate("() => !DONJON_CODES.code('maire:retenu') && !DONJON_CODES.code('leo:attrape') && !DONJON_CODES.code('leo:enfui')"), 'le donjon n\'a plus de code « Le maire est retenu », « Léo attrapé », « Léo s\'est enfui »')
        t = pave('recette:givre')
        verifier(pg.evaluate("() => DJ.Explo._X().partie.recettes.indexOf('givre') >= 0"), f'le code du givre (celui que l\'établi donne à l\'Alchimiste), tapé dans le donjon : le Givre est appris ({t[:50]})')
        if pg.locator('#fenetre [data-act=fermer]').count(): pg.eval_on_selector('#fenetre [data-act=fermer]', 'e => e.click()'); pg.wait_for_timeout(400)
        # la fin (on saute le chemin : les règles du donjon ont leurs propres tests) : la porte, puis Léo
        pg.evaluate("() => { var p = DJ.Explo._X().partie; Regles.entrer(p, 'porte4'); Regles.entrer(p, 'leo'); DJ.garder(p); }")
        f = pg.evaluate("() => DJ.Explo._X().partie.faits")
        verifier(f.get('code:leo:salle') and not f.get('fin') and not f.get('code:leo:battu'), 'les règles : entrer dans la dernière salle donne le code du Barde ; rien n\'est fini tant que Léo est debout')
        pg.evaluate("() => { var p = DJ.Explo._X().partie; Regles.bossBattu(p, 'leo'); DJ.garder(p); }")
        f = pg.evaluate("() => DJ.Explo._X().partie.faits")
        verifier(f.get('fin') and f.get('code:leo:battu') and f.get('combat:leo'), 'les règles : Léo battu, le donjon est fini, le code du Sage est donné')
        pg.eval_on_selector('[data-act=enquete]', 'e => e.click()')
        pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(1300)
        t = texte(pg)
        verifier('Le donjon est fini' in t and 'Place aux accusations' in t and pg.locator('#voile .b-donne').count() == 2, f'on remonte : « Le donjon est fini… Place aux accusations ! », les deux codes ({t[:60]})')
        pg.screenshot(path=f'{OUT}/v4-retour-fini.png')
        pg.context.close()
        # ---------- le Sage : sa tenue, son plan DANS le jeu ----------
        pg = debut(b, 'Sage', 'sage', base + 'index.html#test', sans_donjon=False)
        for _ in range(2):
            pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
        code(pg, 'info:on_descend', True)
        verifier(pg.locator('#voile iframe.ds-tenue').count() == 1 and tenue_prete(pg) == 'sage', 'le Sage voit pour de vrai son héros en tenue de combat')
        pg.screenshot(path=f'{OUT}/v5-sage-tenue.png'); fermer(pg)
        pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('donjon', true); }"); pg.wait_for_timeout(300)
        pg.locator('#livre-ici .lv-page.on [data-act=ds-plan]').click(); pg.wait_for_timeout(3000)
        plan = pg.frame_locator('#donjon-plan-cadre')
        verifier(pg.locator('#donjon-plan-cadre').count() == 1 and '/brumeval/index.html' in pg.url and plan.locator('#b-fermer').is_visible() and not plan.locator('#b-code').is_visible() and not plan.locator('#b-livre').is_visible() and not plan.locator('#rune').is_visible(),
                 'le plan s\'ouvre DANS le jeu (un cadre) : « Refermer », pas de pavé de codes ni de livre à part, pas encore de rune')
        pg.screenshot(path=f'{OUT}/v5-sage-plan.png')
        plan.locator('#b-fermer').click(); pg.wait_for_timeout(600)
        verifier(pg.locator('#donjon-plan-cadre').count() == 0 and pg.evaluate("() => M.UI.ecran") == 'enquete' and pg.locator('#livre-ici').count() == 1, '« Refermer » : on retrouve le Grand Livre')
        code(pg, 'donjon:rune:lumiere', True)
        pg.locator('#voile [data-act=ds-plan]').click(); pg.wait_for_timeout(3500)
        plan = pg.frame_locator('#donjon-plan-cadre')
        verifier(plan.locator('#rune').is_visible() and 'Une rune apparaît' in plan.locator('#bulle').inner_text(), 'le code de la rune, tapé dans l\'enquête : « Une rune apparaît ! », et elle est sur le plan')
        pg.screenshot(path=f'{OUT}/v5-sage-rune.png')
        plan.locator('#b-fermer').click(); pg.wait_for_timeout(500)
        code(pg, 'donjon:page:dechiree', True)
        pg.locator('#voile [data-act=ds-plan]').click(); pg.wait_for_timeout(4000)
        plan = pg.frame_locator('#donjon-plan-cadre')
        verifier(plan.locator('.coin').is_visible() and 'recollent' in plan.locator('#bulle').inner_text() and plan.locator('#rune').is_visible(), 'le morceau déchiré se recolle sur le plan ; la rune est toujours là')
        pg.screenshot(path=f'{OUT}/v5-sage-coin.png')
        plan.locator('#b-fermer').click(); pg.wait_for_timeout(500)
        pg.context.close()
        # ---------- l'Alchimiste : les herbes lumineuses, au chaudron du donjon ----------
        pg = debut(b, 'Alchi', 'alchimiste', base + 'index.html#test', sans_donjon=False)
        code(pg, 'moment:1'); code(pg, 'moment:2')
        code(pg, 'donjon:plante:lumiere', True)
        pg.locator('#voile [data-act=ds-chaudron]').click()
        pg.wait_for_url('**/donjon/alchimiste.html**'); pg.wait_for_timeout(1500)
        verifier(pg.locator('#b-enquete').count() == 1 and pg.evaluate("() => !!ALCHI.etat().codes['plante:lumiere']") and pg.locator('.plante-fen').count() == 1, 'le chaudron du donjon s\'ouvre pour de vrai, et la plante y arrive toute seule (sans retaper le code)')
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
