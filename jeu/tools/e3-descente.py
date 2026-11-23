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

def au_chaudron(pg, fr, prep, pot, formes, nom):
    """(23 novembre, Bible §13.96) LA DEUXIÈME ÉTAPE d'une plante du donjon : son petit pot (fait sur l'établi) part au GRAND CHAUDRON de
    l'atelier. La carte de l'établi n'a plus de code : un bouton jaune « Au grand chaudron ! ». Dans l'atelier, le grimoire montre la
    recette (des ingrédients cueillis, puis le pot) ; on range ce qui manque, on joue le mini-jeu (par ses points d'accès d'essai), et la
    potion réussie montre le code de recette du donjon, pour le Pisteur."""
    carte = fr.evaluate("() => { var c = document.querySelector('.carte.prete'); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('petit pot est un ingrédient' in carte and 'grand chaudron' in carte and fr.locator('#plusCode').count() == 0 and 'Donne ce code' not in carte and fr.locator('.carte.prete .b-jaune[data-chaudron]').count() == 1,
             f'{nom} : la carte du petit pot — un ingrédient pour le grand chaudron, plus de code ici, un bouton jaune ({carte[-70:]})')
    verifier(ET.sans_son(pg, '.carte') == [], 'le 🔊 partout')
    shot(pg, 'alchimiste-pot-' + prep)
    verifier(pg.evaluate("(a) => !!M.P().vus['fiole:' + a[0]] && M.potsPrets()[a[0]] === 1 && M.recettesDonjon().some(r => r.id === a[1]) && M.potionsPretes().n === 7 && !M.P().objets['_donjon:recette:' + a[1]]", [prep, pot]),
             'le jeu a noté le petit pot ; sa recette est au grimoire ; les sept potions restent sept ; pas encore de code')
    ET.toucher(pg, '.carte.prete [data-chaudron]', False); pg.wait_for_timeout(1300)
    verifier(pg.evaluate("() => !M.etabliOuvert() && M.P().onglet === 'role'") and pg.locator(f'#atelier-ici .at-rcarte[data-fiche={pot}]').count() == 1 and pg.locator(f'#atelier-ici .at-rcarte[data-fiche={pot}] .at-ri-pot.ok').count() == 1,
             '« Au grand chaudron ! » : l\'établi se referme, l\'atelier s\'ouvre sur le grimoire — la recette est là, son petit pot est prêt')
    manque = pg.evaluate("(pot) => DONNEES.RECETTES[pot].ingr.filter(x => DONNEES.INGR[x[0]]).map(x => x[0])", pot)
    # le filet : un lieu déjà cueilli à ce moment se recueille tant qu'un ingrédient de la recette manque
    filet = pg.evaluate("""(manque) => { var P = M.P(), E = M.E(), a = M.ingr() || {}, k = manque.filter(function(i){ return !(a[i] > 0); })[0]; if(!k) return 'rien ne manque';
      var l = Object.keys(E.lieux).filter(function(id){ return M.cueilletteIci(id).some(function(c){ return c.ingr === k; }); })[0]; if(!l) return 'pas de lieu pour ' + k;
      var av = P.vus['cueilli:' + l]; P.vus['cueilli:' + l] = P.moment; var r = M.dejaCueilli(l); if(av === undefined) delete P.vus['cueilli:' + l]; else P.vus['cueilli:' + l] = av; return r ? 'bloqué à ' + l : 'ok'; }""", manque)
    verifier(filet in ('ok', 'rien ne manque'), f'le filet de la cueillette : un lieu déjà cueilli se recueille tant qu\'il manque un ingrédient de la recette ({filet})')
    pg.evaluate("""(pot) => { var S = M.S, fx = S.atelier.objets.filter(function(o){ return o.cases && o.cases.length; })[0];
      DONNEES.RECETTES[pot].ingr.forEach(function(x, i){ if(DONNEES.INGR[x[0]]){ var c = fx.cases[i % fx.cases.length]; c.i[x[0]] = (c.i[x[0]] || 0) + x[1]; } }); M.sauver(); M.render(); }""", pot)
    pg.wait_for_timeout(1200)
    avant = pg.evaluate("() => JSON.stringify(Atelier.compter(M.S.atelier))")
    pg.evaluate("() => Atelier._vue().chaudron()"); pg.wait_for_timeout(1200)
    verifier(pg.locator('#atelier-ici .at-mj .mj-go').count() == 1 and pg.locator('#atelier-ici .at-mj .mj-btn-lire, #atelier-ici .at-mj .b-lire').count() >= 1, 'une seule potion prête : le grand chaudron part tout de suite (l\'explication en images, un bouton jaune, sans fiole vide ni action)')
    pg.click('#atelier-ici .at-mj .mj-go', force=True); pg.wait_for_timeout(1200)
    bocaux = pg.evaluate("() => [].map.call(document.querySelectorAll('.mjc-boite'), function(b){ return b.dataset.ingr + (b.classList.contains('mjc-pot') ? '*' : ''); }).join(',')")
    verifier((prep + '*') in bocaux.split(','), f'sur la poutre, avec les bocaux : le petit pot ({bocaux})')
    API = "MJ.TYPES.chaudron._dernier.api"
    for _ in range(220):
        r = pg.evaluate(f"""() => {{ var a = {API}, fin = document.querySelector('.mjc').classList.contains('mjc-phase-fin'), z = a.dansZone(), zf = a.zoneFin();
          a.buches(3); a.chaleur(fin ? (zf[0] + zf[1]) / 2 : 45); if(!fin && z.length) a.verser(z[0]); return !!document.querySelector('.at-mj .mj-resultat'); }}""")
        if r: break
        pg.wait_for_timeout(250)
    pg.wait_for_timeout(600)
    verifier(pg.locator('#atelier-ici .at-mj .mj-resultat:not(.ko)').count() == 1, 'la potion se prépare au grand chaudron : réussie')
    shot(pg, 'alchimiste-chaudron-' + pot)
    pg.click('#atelier-ici .at-mj .mj-continuer', force=True); pg.wait_for_timeout(900)
    t = texte(pg)
    verifier(nom in t and 'Donne ce code au Pisteur' in t and 'dans le donjon' in t and 'C\'est vrai' in t and pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .b-code .b-sym span'), function(e){ return e.textContent; }).join('')") == formes and not sans_son(pg),
             f'la potion réussie : son code pour le Pisteur, et ce qui est vrai ({t[:70]})')
    shot(pg, 'alchimiste-code-' + pot)
    verifier(pg.evaluate("(a) => !!M.P().vus['donjon:potion:' + a[1]] && !!M.P().objets['_donjon:recette:' + a[1]] && !M.potsPrets()[a[0]] && !M.recettesDonjon().length", [prep, pot]),
             'le jeu a noté la potion : son code est dans les codes donnés, le pot est parti, la recette n\'est plus au grimoire')
    apres = pg.evaluate("() => JSON.stringify(Atelier.compter(M.S.atelier))")
    verifier(avant != apres, f'les ingrédients cueillis ont bien été versés ({avant} → {apres})')
    fermer(pg)

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

def six(pg, role, a):
    """(17 novembre, 23 h 30) le code à SIX symboles d'un ami (tenue ET visage), tapé par le Pisteur sur l'écran du départ : la fenêtre
    de la descente doit être ouverte, avec son bouton « 🔢 Le code de… » (ou « 🔢 Retaper son code »)"""
    if pg.locator(f'#voile [data-act=ds-six][data-role={role}]').count() == 0 and pg.locator('#voile [data-act=ds-corriger]').count():
        pg.locator('#voile [data-act=ds-corriger]').click(); pg.wait_for_timeout(300)
    pg.locator(f'#voile [data-act=ds-six][data-role={role}]').first.click(); pg.wait_for_timeout(300)
    seq = pg.evaluate("([r, a]) => M.code6De(r, a)", [role, a])   # (23 novembre : seize coiffures dans le code, descente.js)
    for x in seq: ev(pg, 'd6-sym', {'s': x}); pg.wait_for_timeout(60)
    pg.wait_for_timeout(500)

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
    verifier('tenue de combat' in t and 'au Sage et à l\'Alchimiste' in t and pg.evaluate("() => !!M.P().objets['_info:on_descend']"), 'le code du départ est donné : « On va dans la crypte », pour le Sage et l\'Alchimiste')
    # (14 novembre, Bible §13.36) et un deuxième code, pour le Barde : la grille s'est ouverte sans bruit
    verifier(pg.locator('#voile .b-donne').count() == 2 and pg.locator('#voile .b-code').count() == 2 and 'Pas un bruit ! Le Barde doit le savoir' in t and pg.evaluate("() => !!M.P().objets['_info:grille_silence'] && !M.P().objets['_info:grille_bruit']"), 'et un deuxième code, pour le Barde : « La grille s\'ouvre sans bruit »')
    verifier(pg.evaluate("() => M.UI.modal.codes") == ['info:on_descend', 'info:grille_silence'] and pg.evaluate("() => M.destinataire('info:grille_silence')") == 'barde', 'les deux codes sont dans la même fenêtre ; le deuxième est pour le Barde')
    verifier(not sans_son(pg) and jaune(pg, '#voile .b-choix-point [data-id=descendre]'), f'le 🔊, et le bouton jaune « 🕯️ Descendre » ({sans_son(pg)})')
    shot(pg, 'soulever')
    fermer(pg)
    pts = lieu(pg, 'clocher')
    verifier(pts == ['cle', 'crypte', 'soulever', 'descendre'], f'les deux autres gestes s\'en vont ({pts})')
    point(pg, 'descendre')
    t = texte(pg)
    verifier('Il est temps d\'enfiler notre tenue de combat' in t and 'Le code du Sage' in t and 'Le code de l\'Alchimiste' in t and 'sept potions pour descendre' in t, f'la fenêtre de la tenue : les deux codes attendus ({t[:70]})')
    verifier(pg.locator('#voile [data-act=ds-aller]').count() == 0 and pg.locator('#voile [data-act=ds-six]').count() == 2 and pg.locator('#voile .b-code').count() == 1 and pg.locator('#voile .ds-tenue').count() == 1, 'pas de descente sans les deux codes ; le code du départ est rappelé ; le héros est en tenue')
    verifier(not sans_son(pg) and jaune(pg, '#voile [data-act=ds-six][data-role=sage]') and jaune(pg, '#voile [data-act=ds-six][data-role=alchimiste]'), f'cette fenêtre : le 🔊 partout, et deux boutons jaunes ({sans_son(pg)})')
    shot(pg, 'tenue-pisteur')
    verifier(pg.evaluate("() => M.P().vus['donjon:entree']") == 'crypte', 'l\'entrée est retenue : la crypte')
    # (17 novembre, 21 h 46) l'écran spécial : le code de SIX symboles de chaque ami (tenue ET visage)
    pg.locator('#voile [data-act=ds-six][data-role=sage]').click(); pg.wait_for_timeout(300)
    t = texte(pg)
    verifier('Le code du Sage' in t and pg.locator('#voile [data-act=d6-sym]').count() == 12 and pg.locator('#voile .ds-six .b-case').count() == 6 and not sans_son(pg), f'l\'écran du code à six symboles ({t[:60]})')
    shot(pg, 'six')
    sA = {'sexe': 'f', 'peau': 'p2', 'cheveux': 'rose', 'age': 'adulte', 'coiffure': 'couettes', 'yeux': 'violet', 'barbe': ''}
    sS = {'sexe': 'm', 'peau': 'p6', 'cheveux': 'blond', 'age': 'adulte', 'coiffure': 'boucles', 'yeux': 'bleu', 'barbe': 'courte'}
    tout6 = lambda r, a: pg.evaluate("([r, a]) => M.code6De(r, a)", [r, a])   # (23 novembre : seize coiffures dans le code, descente.js)
    def taper6(seq):
        for s in seq: ev(pg, 'd6-sym', {'s': s}); pg.wait_for_timeout(60)
        pg.wait_for_timeout(500)
    taper6(['chat'] * 6); t = texte(pg)
    verifier('ne marche pas' in t and pg.evaluate("() => (M.UI.modal.seq || []).length") == 0 and not pg.evaluate("() => M.P().allures"), f'six dessins au hasard : « ça ne marche pas », on recommence ({t[:70]})')
    taper6(tout6('alchimiste', sA)); t = texte(pg)
    verifier('l\'autre ami' in t and not pg.evaluate("() => M.P().allures"), 'le code de l\'Alchimiste tapé pour le Sage : « celui de l\'autre ami »')
    ev(pg, 'd6-sym', {'s': 'lune'}); ev(pg, 'd6-efface', {}); pg.wait_for_timeout(200)
    verifier(pg.evaluate("() => (M.UI.modal.seq || []).length") == 0, '⌫ efface le dernier dessin')
    taper6(tout6('sage', sS)); t = texte(pg)
    a = pg.evaluate("() => M.P().allures.sage")
    verifier('Le Sage est prêt' in t and a['sexe'] + a['peau'] + a['cheveux'] == 'mp6blond' and a.get('coiffure') == 'boucles' and a.get('yeux') == 'bleu' and a.get('barbe') == 'courte' and a.get('vu') and not sans_son(pg), f'le code du Sage : toute sa tenue ET son visage d\'un coup ({t[:60]} ; {a})')
    verifier('deuxième code' not in t and pg.locator('#voile [data-act=ds-code]').count() == 0, 'plus de « deuxième code » : un seul code suffit')
    verifier(pg.locator('#voile .ds-six').count() == 0 and pg.locator('#voile .ds-amis button:disabled').count() == 1 and pg.locator('#voile [data-act=ds-six][data-role=sage]').count() == 0 and pg.locator('#voile [data-act=ds-six][data-role=alchimiste]').count() == 1, '(19 novembre) après le code du Sage, on revient à la fenêtre des deux boutons : celui du Sage est validé et bloqué, celui de l\'Alchimiste attend')
    shot(pg, 'recu-sage'); fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre')
    t = texte(pg)
    verifier('Le Sage est prêt' in t and 'Le code de l\'Alchimiste' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0 and pg.locator('#voile [data-act=ds-six]').count() == 1, 'il manque encore l\'Alchimiste')
    pg.locator('#voile [data-act=ds-six][data-role=alchimiste]').click(); pg.wait_for_timeout(300)
    taper6(tout6('alchimiste', sA)); t = texte(pg)
    verifier('Son code est tapé' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0 and pg.evaluate("() => (M.P().sac || []).length") == 0, f'le code de l\'Alchimiste, SANS ses potions : son code est tapé, mais pas de « Descendre » ({t[:60]})')
    fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre'); t = texte(pg)
    verifier('Il te manque ses sept potions' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'la tenue est là, mais il lui manque ses sept potions')
    fermer(pg)
    # (17 novembre) le code des sept potions, celui de l'après-midi : rien que les potions, ni tenue ni donjon
    t = code(pg, 'info:sac_pret', True)
    verifier('sept potions' in t and 'tenue' not in t and 'donjon' not in t and pg.locator('#voile .pl-fiole.pl-pleine').count() == 7, f'« Les sept potions » : les voilà dans son sac, sans parler de tenue ni de donjon ({t[:80]})')
    fermer(pg)
    lieu(pg, 'clocher'); point(pg, 'descendre'); t = texte(pg)
    verifier(pg.locator('#voile [data-act=ds-voir]').count() == 1 or pg.locator('#voile [data-act=ds-aller]').count() == 1, 'les deux amis et les potions : on peut descendre')
    verifier('c-couettes' in pg.evaluate("() => M.donjonLook()") and '.violet' in pg.evaluate("() => M.donjonLook()"), f'les visages partent au donjon ({pg.evaluate("() => M.donjonLook()")})')
    verifier(pg.evaluate("() => (M.P().sac || []).join(',')") == 'feu,fumigene,huile,colle,acide,baume,coeur', 'les sept potions sont dans son sac')
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
    # (Romain, 17 novembre, 7 h 12 : « on a assez de codes comme ça ») plus de code « Odette est derrière la porte » : à voix haute
    verifier(pg.evaluate("() => !!M.P().vus['donjon:porte'] && !M.P().objets['_info:odette_porte'] && !M.P().vus['donjon:fini']"), 'la porte aux quatre signes est trouvée : c\'est noté, sans code à donner')
    verifier(any('la voix d\'Odette' in x and 'voix haute' in x for x in pg.evaluate("() => M.P().carnet.map(function(x){ return x.t; })")), 'son Carnet le dit : la voix d\'Odette derrière la porte, à dire à voix haute')
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
    verifier('Le donjon est fini' in t and 'Sous la cape noire : Léo' in t and 'Place aux accusations' in t and pg.locator('#voile .b-donne').count() == 1, f'au retour : « Le donjon est fini… Place aux accusations ! », et un code à donner (plus celui de la porte) ({t[:60]})')
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
    att = {'info:leo_la': 'etoile-arbre-flamme', 'info:leo_battu': 'lune-flamme-chat', 'info:odette_porte': 'chapeau-lune-coeur', 'info:grosse_marie': 'cloche-cloche-lune'}   # (odette_porte : en réserve, ses symboles ne bougent pas)
    vu = pg.evaluate("(l) => { var o = {}; l.forEach(function(k){ o[k] = M.code(k).join('-'); }); return o; }", list(att.keys()))
    verifier(vu == att, f'les quatre codes partagés ont les symboles du donjon ({vu})')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()), vus = {}, n = 0; Object.keys(c.parId).forEach(function(id){ var k = c.parId[id].join('-'); if(vus[k]) n++; vus[k] = 1; }); return n; }") == 0, 'aucun code de l\'enquête 3 n\'est en double (les codes du donjon et les 432 codes d\'allure compris)')
    verifier(pg.evaluate("() => { for(var n = 0; n < 1296; n++){ var a = M.allureDe(n); if(M.allureNumero(a.role, a) !== n) return false; } return !!M.code('allure:431') && !!M.code('allure:1295') && !M.code('allure:1296') && !M.code('sac:5') && !M.code('info:maire_retenu') && !M.code('info:leo_attrape') && !M.code('info:leo_enfui'); }"), 'les 1296 codes d\'allure (432 × trois âges) se lisent et s\'écrivent ; plus de code du sac, du maire retenu, de « Léo attrapé / enfui »')
    pg.context.close()

    # ---------- tirer, pousser : le bruit
    for geste in ('tirer', 'pousser'):
        pg = debut(b, 'Pisteur', 'pisteur')
        code(pg, 'moment:1'); code(pg, 'moment:2')
        cle_anselme(pg, True)
        ouvrir_grille(pg, geste)
        t = texte(pg)
        verifier('Un énorme bruit s\'est entendu dans tout le village' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1 and pg.locator('#voile .b-code').count() == 2, f'{geste} : « un énorme bruit s\'est entendu dans tout le village », le code du départ, puis « Descendre » ({t[:60]})')
        verifier(pg.evaluate(f"() => M.P().vus['pisteur:clocher:{geste}'] === 'ok' && !M.P().vus['pisteur:clocher:soulever']") and not sans_son(pg), 'le bruit est retenu')
        # (14 novembre, Bible §13.36) le bruit part chez le Barde : « La grille a hurlé »
        verifier('Tout le village a entendu ! Le Barde doit le savoir' in t and pg.evaluate("() => M.UI.modal.codes") == ['info:on_descend', 'info:grille_bruit'] and pg.evaluate("() => !!M.P().objets['_info:grille_bruit'] && !M.P().objets['_info:grille_silence']"), f'{geste} : un deuxième code, pour le Barde — « La grille a hurlé »')
        sac = pg.evaluate("() => { var d = document.createElement('div'); d.innerHTML = M.objetsTrouves(); return d.textContent.replace(/\\s+/g, ' '); }")
        verifier('La grille a hurlé' in sac and 'On va dans la crypte' in sac and 'Barde' in sac, f'le Pisteur retrouve ses deux codes dans son sac, avec leur destinataire ({sac[:90]})')
        if geste == 'tirer': shot(pg, 'tirer')
        pg.context.close()

    # ======================================================================== le Pisteur, par le puits
    print('— Le Pisteur B : le puits')
    pg = debut(b, 'Pisteur', 'pisteur')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    cle_anselme(pg, False)
    # (15 novembre, 14 h 28) d'abord les traces de Moustache jusqu'au puits, à travers la forêt (on n'y perd jamais)
    lieu(pg, 'clocher'); point(pg, 'traces_puits')
    pg.locator('#voile [data-act=mj-go]').click(); pg.wait_for_timeout(900)
    if pg.locator('#mj-plein .mj-go').count(): pg.locator('#mj-plein .mj-go').click(); pg.wait_for_timeout(2600)
    pg.evaluate("() => window.__finir(true)"); pg.wait_for_timeout(600)
    fermer(pg)
    pts = lieu(pg, 'puits')
    verifier(pts == ['grille'], f'la clé ratée, les traces suivies : le puits, sa grille ({pts})')
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
    verifier('Pssshhh' in t and pg.locator('#voile .b-choix-point [data-id=descendre]').count() == 1 and pg.locator('#voile .b-code').count() == 2, 'avec le code de l\'Alchimiste : « Pssshhh ! », le code du départ, et « 🕯️ Descendre »')
    # (14 novembre, Bible §13.36) par le puits aussi, un code pour le Barde : le maire viendra le trouver à la fête
    verifier(pg.evaluate("() => M.UI.modal.codes") == ['info:on_descend', 'info:puits_ouvert'] and 'Le Barde doit le savoir' in t and pg.evaluate("() => !!M.P().objets['_info:puits_ouvert']"), 'et un deuxième code, pour le Barde : « Le puits est ouvert »')
    shot(pg, 'puits-acide')
    point(pg, 'descendre')
    t = texte(pg)
    # (Romain, 17 novembre, 23 h 13 : « l'Alchimiste a les yeux marron alors que son personnage a les yeux bleus ») un ami dont le Pisteur
    # n'a tapé que l'ANCIEN code d'allure à trois symboles (sans visage) n'est plus « prêt » : son bouton « 🔢 Le code de… » reste là
    verifier('Le code du Sage' in t and 'Le code de l\'Alchimiste' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0 and pg.locator('#voile [data-act=ds-six]').count() == 2,
             'l\'ancien code à trois symboles de l\'Alchimiste ne suffit plus : la fenêtre demande encore le code à six symboles des deux amis')
    six(pg, 'alchimiste', {'sexe': 'm', 'peau': 'p2', 'cheveux': 'brun', 'age': 'adulte', 'coiffure': 'boucles', 'yeux': 'bleu', 'barbe': ''})
    t = texte(pg); a = pg.evaluate("() => M.P().allures.alchimiste")
    verifier('L\'Alchimiste est prêt' in t and a.get('yeux') == 'bleu' and a.get('vu') and 'a:m.p2.brun.bleu' in pg.evaluate("() => M.donjonLook()"), f'son code à six symboles : ses yeux bleus partent au donjon ({pg.evaluate("() => M.donjonLook()")})')
    verifier(pg.locator('#voile [data-act=ds-six][data-role=alchimiste]').count() == 0 and pg.locator('#voile [data-act=ds-corriger]').count() == 1, '(19 novembre) son bouton est validé (plus touchable) ; « ✏️ Corriger un code » est là')
    pg.locator('#voile [data-act=ds-corriger]').click(); pg.wait_for_timeout(300)
    verifier(pg.locator('#voile [data-act=ds-six][data-role=alchimiste]').count() == 1 and 'Retaper le code' in texte(pg), '« Corriger un code » : le bouton « 🔢 Retaper le code de l\'Alchimiste » est de nouveau là')
    six(pg, 'alchimiste', {'sexe': 'm', 'peau': 'p2', 'cheveux': 'brun', 'age': 'adulte', 'coiffure': 'boucles', 'yeux': 'gris', 'barbe': ''})
    verifier(pg.evaluate("() => M.P().allures.alchimiste.yeux") == 'gris', 'retapé : le héros change (des yeux gris)')
    six(pg, 'alchimiste', {'sexe': 'm', 'peau': 'p2', 'cheveux': 'brun', 'age': 'adulte', 'coiffure': 'boucles', 'yeux': 'bleu', 'barbe': ''})
    fermer(pg)
    lieu(pg, 'puits'); point(pg, 'descendre'); t = texte(pg)
    verifier('Le code du Sage' in t and 'L\'Alchimiste est prêt' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0, 'la fenêtre de la tenue : il manque le Sage')
    six(pg, 'sage', {'sexe': 'f', 'peau': 'p5', 'cheveux': 'noir', 'age': 'adulte', 'coiffure': 'tresses', 'yeux': 'ambre', 'barbe': ''}); fermer(pg)
    lieu(pg, 'puits'); point(pg, 'descendre')
    verifier(pg.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pg.locator('#voile [data-act=ds-aller]').count() == 1, 'les deux codes tapés : la fenêtre de la descente, sept potions')
    pg.locator('#voile [data-act=ds-aller]').click(); pg.wait_for_timeout(300)
    u = vers(pg); j = jeton(pg)
    verifier('entree=puits' in u and 'potions=feu,fumigene,huile,colle,acide,baume,coeur' in u, f'on part par le puits, avec les sept potions ({u[-120:]})')
    verifier(lieu(pg, 'clocher') == ['cle', 'traces_puits'], 'toujours pas de crypte au clocher (la clé, et les traces jusqu\'au puits)'); fermer(pg)
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
    # (17 novembre, étape 4 du nouveau fil : « rien n'arrive par magie dans le Grand Livre ») PLUS DE PAGE « Le plan des souterrains » :
    # ni le matin (elle disait « il y aurait de vieux souterrains »), ni la nuit. Ce Sage-ci n'a pas le vieux plan d'Odette : le filet.
    l = pages()
    verifier('donjon' not in l and 'vieuxplan' not in l and 'porte' not in l, f'le matin : aucune page de plan, aucune page de porte dans le Grand Livre ({l})')
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    l = pages()
    verifier('donjon' not in l and 'vieuxplan' not in l, f'la nuit, avant le départ : aucun plan arrivé tout seul ({l[-6:]})')
    verifier('sauvegardes' not in l and 'aventurier' not in l and 'tenue' not in l, f'avant le départ : ni pages de sauvegarde, ni carnet, ni tenue ({l[-8:]})')
    # le code du départ : la tenue, son code, les pages de sauvegarde
    t = code(pg, 'info:on_descend', True)
    verifier('Il est temps d\'enfiler notre tenue de combat' in t and 'Montre ce code au Pisteur' in t and pg.locator('#voile .ds-moncode .b-code').count() == 1 and pg.locator('#voile .ds-moncode .b-sym').count() == 6 and pg.locator('#voile .ds-tenue').count() == 1, f'« On va dans la crypte » : la tenue de combat, et son code pour le Pisteur ({t[:60]})')
    verifier(not sans_son(pg) and jaune(pg, '#voile .b-aller'), f'le 🔊 partout, et un bouton jaune ({sans_son(pg)})')
    moi = pg.evaluate("() => M.allureCode()")
    verifier(pg.evaluate("(id) => { var a = M.allureDe(+id.split(':')[1]), h = M.S.heros; return a.role === 'sage' && a.sexe === (h.sexe === 'm' ? 'm' : 'f') && a.peau === h.peau && a.cheveux === h.cheveux; }", moi), f'ce code dit bien son héros ({moi})')
    verifier(pg.evaluate("() => { var r = M.decoderTenue6(M.tenueCode6()), h = M.S.heros, v = M.allureMoi(true); return !!r && r.a.role === 'sage' && r.a.peau === h.peau && r.a.cheveux === h.cheveux && r.vz.coiffure === v.coiffure && r.vz.yeux === v.yeux && M.tenueCode6().length === 6; }"), 'son code à six symboles redonne bien son héros, tenue et visage')
    shot(pg, 'sage-tenue'); fermer(pg)
    t = code(pg, 'info:on_descend', True); verifier('Montre ce code au Pisteur' in t, 'le code retapé : la même fenêtre (il retrouve son code)'); fermer(pg)
    t = code(pg, moi, True); verifier('pour le Pisteur' in t, f'son propre code tapé chez lui : « pour le Pisteur » ({t[:50]})'); fermer(pg)
    l = pages()
    verifier('sauvegardes' in l and 'tenue' in l and 'vieuxplan' in l and 'donjon' not in l and l.index('tenue') < l.index('sauvegardes'), f'ses pages : le vieux plan, la tenue, les sauvegardes ({l[-9:]})')
    # le filet : sans le vieux plan d'Odette (la cachette jamais ouverte), le plan arrive avec le code du départ — gravé en haut de l'escalier
    # (19 novembre, 11 h 01 ; Bible §13.78) la page EST le plan (vieux-plan.js ; le détail : tools/e3-vieuxplan.py) : plus de textes, plus
    # de bouton « Regarder le plan de tout près », plus de fenêtre par-dessus le jeu
    t = livre('vieuxplan')
    sv = pg.evaluate("() => document.querySelector('#livre-ici .lv-page.on .vp-couche svg.plan-svg').textContent")
    verifier(pg.locator(ACT + '[data-vp].vp-nuit').count() == 1 and 'Fondateurs' in sv and 'étui de cuir' not in t and 'Le Pisteur a ouvert le passage' not in t and pg.locator(ACT + '[data-act=ds-plan]').count() == 0,
             f'le filet : le plan gravé dans la pierre, en grand, avec ses noms — sans texte, sans bouton ({t[:60]})')
    verifier('gravé dans la pierre' in texte(pg, '#livre-ici .lv-page.on') or 'gravé dans la pierre' in pg.evaluate("() => document.querySelector('#livre-ici .lv-page.on').innerText"), 'son titre : « Le plan gravé dans la pierre »')
    verifier(not sans_son(pg, '#livre-ici .lv-page.on'), 'la page a ses 🔊')
    shot(pg, 'sage-plan')
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
    # (19 novembre, 11 h 01) LA PIERRE DE RUNE rejoint la poche du Sage ; il la promène sur le vieux plan, dans son Grand Livre (la page
    # est le plan) : l'encre de la rune s'y réveille (tools/e3-vieuxplan.py)
    verifier(pg.evaluate("() => !document.querySelector('.vp-pierre[data-vp-pierre=rune]')"), 'avant son code : pas de pierre de rune dans la poche')
    t = code(pg, 'donjon:rune:lumiere', True)
    verifier('Une pierre de rune' in t and 'ta poche' in t and 'Promène-la' in t and jaune(pg, '#voile [data-act=ds-livre][data-id=vieuxplan]') and pg.locator('#voile [data-act=ds-plan]').count() == 0 and not sans_son(pg), f'la rune : « Une pierre de rune ! … Elle rejoint ta poche. Promène-la sur le vieux plan », puis le Grand Livre ({t[:50]})')
    shot(pg, 'sage-rune')
    pg.locator('#voile [data-act=ds-livre]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'vieuxplan' and pg.locator(ACT + '.vp-pierre[data-vp-pierre=rune].b-guide').count() == 1, 'le Grand Livre s\'ouvre sur le vieux plan ; la pierre de rune est dans la poche, avec le rond jaune')
    r = pg.evaluate("() => window.__vp.promener('rune', [[980, 840], [1080, 840], [1080, 870], [980, 870], [980, 900], [1080, 900]], 44)")
    verifier(r and r['id'] == 'bourse' and r['fini'] and pg.evaluate("() => M.P().vus['encre:bourse'] === 1"), f'la rune promenée sur la galerie : « une bourse d\'or dort ici » ({r})')
    verifier('La pierre de rune' in pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('objets', true); return document.querySelector('#livre-ici .lv-page.on').innerText; }"), '« Les objets magiques » : la pierre de rune, à côté de la pierre de Tim')
    t = code(pg, 'donjon:page:dechiree', True)
    verifier('morceau' in t and pg.locator('#voile [data-act=ds-plan]').count() == 1, 'le morceau déchiré du plan')
    pg.locator('#voile [data-act=ds-plan]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.livrePage()") == 'vieuxplan' and pg.locator(ACT + '.vp-coin').count() == 1 and 'recollent' in texte(pg, '#livre-ici .lv-page.on .vp-dit'), '« Regarder le plan » : le Grand Livre s\'ouvre sur le plan, le coin est recollé')
    # la porte : le Pisteur lui dicte le code
    # (17 novembre, étape 4 ; Romain : « C'est quoi la porte des Fondateurs ? On s'en fout ») plus de page : le code dit tout
    # (17 novembre, 7 h 12) plus de code de la porte : rien à taper
    verifier('porte' not in pages(), f'plus de page « La porte des Fondateurs », même avec le code ({pages()[-6:]})')
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
    verifier('sept potions à la ceinture' in t and pg.locator('#voile .ds-moncode .b-sym').count() == 6, 'avec ses sept potions : son code pour le Pisteur')
    moi = 'info:sac_pret'; att = pg.evaluate("(id) => M.code(id).map(function(s){ return DONNEES.SYM[s].e; }).join('')", moi)
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
    # (23 novembre) DEUX ÉTAPES : l'établi ne fait plus la potion, il fait un ingrédient (les cristaux de givre, dans un petit pot) ;
    # le pot part au grand chaudron de l'atelier (l'eau, la menthe, puis le pot), et c'est la potion du chaudron qui donne le code
    verifier('givre' in ET.etat(pg)['faites'] and len(R['RE']['givre']['etapes']) == 6 and R['RE']['givre'].get('pot') is True, 'les cristaux de givre se préparent sur l\'établi, geste par geste : six étapes, la dernière dans un petit pot')
    verifier(pg.evaluate("() => M.code('donjon:recette:givre').join('-') === 'champi-coeur-cle'"), 'le code de la recette est toujours celui du donjon')
    au_chaudron(pg, fr, 'givre', 'givre', '🍄❤️🔑', 'La potion de givre')
    # (16 novembre, Bible §13.55) la mousse lumineuse (avant : « les herbes lumineuses ») : un brin sur la paillasse d'analyse, le reste dans
    # l'ancien chaudron du donjon
    t = code(pg, 'donjon:plante:lumiere', True)
    # (23 novembre) comme la fleur de givre : la mousse arrive sur l'établi ; le brin du labo reste, pour la regarder de près ; plus de chaudron du donjon
    verifier('mousse' in t and 'herbes' not in t and 'établi' in t and jaune(pg, '#voile [data-act=ds-etabli]') and pg.locator('#voile [data-act=ds-labo]').count() == 1 and pg.locator('#voile [data-act=ds-chaudron]').count() == 0 and not sans_son(pg),
             f'la mousse lumineuse : elle va sur l\'établi (bouton jaune) ; on peut aussi la regarder de près ; plus de « chaudron du donjon » ({t[:60]})')
    verifier(pg.evaluate("() => M.P().plantes.mousse === 1 && !!M.P().vus['plante:mousse'] && M.recettesDonjon().some(function(r){ return r.id === 'baumelum'; })"), 'la mousse attend sur la tringle de l\'établi ; la recette du baume lumineux est au grimoire')
    verifier(pg.evaluate("() => !!M.P().recus['obj:mousse'] && M.E().labo.indexOf('mousse') >= 0 && !M.P().analyses.mousse"), 'un brin de mousse attend sur la paillasse d\'analyse')
    # … au labo : la loupe (le casier des feuilles a une mousse de plus), puis la découverte, sans code
    pg.locator('#voile [data-act=ds-labo]').click(); pg.wait_for_timeout(1800)
    fl = next((x for x in pg.frames if x.parent_frame is not None), None)
    fl.wait_for_function('() => !!window.__labo', timeout=8000); fl.evaluate("() => { if(window.__labo.mimi) window.__labo.mimi.calme = true; var g = document.querySelector('.intro-go'); if(g) g.click(); }"); pg.wait_for_timeout(400)
    def clab(sel):
        fl.wait_for_function('() => !window.__labo.etat().occupe', timeout=9000); fl.click(sel, force=True)
    verifier('mousse' in fl.evaluate("() => window.__labo.cuirs()"), f'le labo s\'ouvre, la mousse est sur le cuir ({fl.evaluate("() => window.__labo.cuirs()")})')
    clab('#ech-mousse'); pg.wait_for_timeout(400); clab('#gLoupe'); pg.wait_for_timeout(2200)
    clab('#tir-d .facade'); pg.wait_for_timeout(1300); clab('#tir-d [data-casier="feuilles"]'); pg.wait_for_timeout(900)
    verifier(fl.locator('[data-ech="feuilles:mousselum"]').count() == 1, 'le casier des feuilles a une mousse de plus')
    clab('[data-ech="feuilles:mousselum"]'); pg.wait_for_timeout(2600); clab('#bFermer'); pg.wait_for_timeout(900)
    clab('#ech-mousse'); pg.wait_for_timeout(300)
    verifier(fl.evaluate("() => window.__labo.etat().finis.mousse && document.querySelector('#gMicro').classList.contains('ok') && document.querySelector('[data-outil=flamme]').classList.contains('ok')"), 'la mousse est reconnue ; le microscope et la bougie restent allumés pour elle')
    clab('[data-act="flamme"]'); pg.wait_for_timeout(3000)
    tb = fl.evaluate("() => { var b = document.querySelector('.bulle-o'); return b ? b.textContent : ''; }")
    verifier('renvoie' in tb, f'à la bougie : elle renvoie la lumière ({tb[:50]})')
    pg.screenshot(path=f'{OUT}/mousse-labo.png')
    fl.evaluate("() => window.__labo.quitter()"); pg.wait_for_timeout(900)
    t = texte(pg)
    verifier('or des lutins' in t and pg.locator('#voile .b-donne').count() == 0 and pg.evaluate("() => !!M.P().analyses.mousse"), f'en sortant : la découverte (« l\'or des lutins »), sans code ({t[:60]})')
    pg.evaluate("() => { M.fermer(); }"); pg.wait_for_timeout(500)
    # … puis l'établi (la fenêtre, relue : plus de bouton du labo), la poudre de mousse en petit pot, et le grand chaudron : le baume lumineux
    t = code(pg, 'donjon:plante:lumiere', True)
    verifier('mousse' in t and pg.locator('#voile [data-act=ds-labo]').count() == 0 and jaune(pg, '#voile [data-act=ds-etabli]'), 'la mousse déjà regardée : il ne reste que l\'établi')
    pg.locator('#voile [data-act=ds-etabli]').click(); pg.wait_for_timeout(300)
    fr = ET.ouvrir(pg)
    verifier(fr.evaluate("() => !!document.querySelector('#pendue-mousse') && document.querySelector('#potion-mousse').style.display !== 'none'"), 'l\'établi s\'ouvre : la mousse pend à la tringle, son petit pot vide attend')
    R = ET.recettes(pg)
    ET.faire(pg, 'mousse', R); pg.wait_for_timeout(1300)
    verifier('mousse' in ET.etat(pg)['faites'] and len(R['RE']['mousse']['etapes']) == 4 and R['RE']['mousse'].get('pot') is True, 'la poudre de mousse se prépare sur l\'établi : sécher, écraser, tamiser, et dans un petit pot')
    au_chaudron(pg, fr, 'mousse', 'baumelum', '🐱🌳🌙', 'Le baume lumineux')
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
        # (17 novembre, 23 h 30) comme chez Romain : l'ancien code à trois symboles de l'Alchimiste d'abord (ses potions, pas son visage),
        # puis les deux codes à six symboles — l'Alchimiste a les yeux bleus
        code(pg, allure(pg, 'alchimiste', 'f', 'p2', 'rose'))
        lieu(pg, 'clocher'); point(pg, 'descendre'); pg.wait_for_timeout(400)
        six(pg, 'sage', {'sexe': 'm', 'peau': 'p6', 'cheveux': 'blond', 'age': 'adulte', 'coiffure': 'milong', 'yeux': 'gris', 'barbe': ''}); fermer(pg)
        lieu(pg, 'clocher'); point(pg, 'descendre'); pg.wait_for_timeout(400)
        six(pg, 'alchimiste', {'sexe': 'f', 'peau': 'p2', 'cheveux': 'rose', 'age': 'adulte', 'coiffure': 'chignon', 'yeux': 'bleu', 'barbe': ''}); fermer(pg)
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
        verifier(pg.evaluate("() => DJ.LOOK.alchimiste.ir === DonjonAllure.YX.bleu && DJ.LOOK.sage.ir === DonjonAllure.YX.gris") and 'a:f.p2.rose.bleu' in (P['look'] or ''), 'dans le donjon, l\'Alchimiste a bien ses yeux bleus (et le Sage ses yeux gris)')
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
        verifier('Le donjon est fini' in t and 'Place aux accusations' in t and pg.locator('#voile .b-donne').count() == 1, f'on remonte : « Le donjon est fini… Place aux accusations ! », un code ({t[:60]})')
        pg.screenshot(path=f'{OUT}/v4-retour-fini.png')
        pg.context.close()
        # ---------- le Sage : sa tenue, son plan DANS le jeu ----------
        pg = debut(b, 'Sage', 'sage', base + 'index.html#test', sans_donjon=False)
        for _ in range(2):
            pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
        code(pg, 'info:on_descend', True)
        verifier(pg.locator('#voile iframe.ds-tenue').count() == 1 and tenue_prete(pg) == 'sage', 'le Sage voit pour de vrai son héros en tenue de combat')
        pg.screenshot(path=f'{OUT}/v5-sage-tenue.png'); fermer(pg)
        # (19 novembre, 11 h 01) le plan n'ouvre plus de cadre par-dessus le jeu : c'est la page du Grand Livre (tools/e3-vieuxplan.py)
        pg.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('vieuxplan', true); }"); pg.wait_for_timeout(500)
        verifier(pg.locator('#livre-ici .lv-page.on [data-vp].vp-nuit').count() == 1 and pg.locator('#donjon-plan-cadre').count() == 0 and pg.locator('#livre-ici .lv-page.on [data-act=ds-plan]').count() == 0, 'le plan est la page du Grand Livre : pas de cadre par-dessus le jeu')
        pg.screenshot(path=f'{OUT}/v5-sage-plan.png')
        code(pg, 'donjon:rune:lumiere', True)
        pg.locator('#voile [data-act=ds-livre]').click(); pg.wait_for_timeout(600)
        verifier(pg.locator('#livre-ici .lv-page.on .vp-pierre[data-vp-pierre=rune]').count() == 1, 'la pierre de rune, dans la poche, au-dessus du plan')
        pg.screenshot(path=f'{OUT}/v5-sage-rune.png')
        pg.context.close()
        # ---------- l'Alchimiste : la mousse lumineuse ne quitte plus le jeu (23 novembre) ----------
        # (avant : son code ouvrait l'ancien chaudron du donjon, une page à part — donjon/alchimiste.html ; maintenant : l'établi, puis le grand chaudron)
        pg = debut(b, 'Alchi', 'alchimiste', base + 'index.html#test', sans_donjon=False)
        code(pg, 'moment:1'); code(pg, 'moment:2')
        code(pg, 'donjon:plante:lumiere', True)
        verifier(pg.locator('#voile [data-act=ds-chaudron]').count() == 0 and pg.locator('#voile [data-act=ds-etabli]').count() == 1, 'la mousse lumineuse, avec le vrai donjon à côté : plus de bouton vers l\'ancien chaudron du donjon')
        pg.locator('#voile [data-act=ds-etabli]').click(); pg.wait_for_timeout(600)
        fr2 = ET.ouvrir(pg)
        verifier(bool(fr2) and 'index.html' in pg.url and fr2.evaluate("() => !!document.querySelector('#pendue-mousse')"), 'l\'établi s\'ouvre dans le jeu, la mousse pend à la tringle : on ne part plus vers une autre page')
        pg.screenshot(path=f'{OUT}/v6-alchimiste.png')
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
