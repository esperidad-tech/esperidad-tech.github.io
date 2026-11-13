"""Enquête 3, étape 4 (Bible § 13.14) : l'Alchimiste, du matin à la nuit (Playwright).
Le matin : ses missions, l'établi dans l'atelier, le gâteau de la fête chez Gaspard ; les cueillettes (12 novembre, Bible §13.26 : sept
endroits cachés de la carte, tools/cueillette_outils.py) : l'oseille et la mélisse, le souci et le lin pas avant l'après-midi, les trois
lointaines hors d'atteinte sans Bertille, puis Bertille et les sept plantes (le robot qui touche la carte au doigt : e3-cueillette.py).
L'établi (refait le 12 novembre : un cadre, src/etabli/, tools/etabli_outils.py) : l'explication en images et son bouton jaune, un outil
touché les mains vides, une mauvaise partie, un mauvais outil, l'huile de lin encore vide, puis les sept potions, geste par geste, au
doigt ; la carte « C'est vrai ! » ; le grimoire (sept pages, chaque texte avec son 🔊) ; le sac ; on quitte au milieu d'une potion et on
la retrouve.
L'après-midi : la lettre au labo — sans le Livre d'or (« Il te faudrait d'autres écritures… »), puis avec : une mauvaise écriture, celle de
Mélusine, le pollen au microscope, l'eau chaude et l'encre de noix de galle → le code « L'écriture de Mélusine » ; le gâteau au maire.
La nuit : « 🎒 Ton sac ! », le code du sac ; un Pisteur le tape : il reçoit les sept potions (et un sac de trois potions : trois).
Enfin : pas d'établi dans l'atelier d'une enquête 2.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-alchimiste.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, ICI)
import etabli_outils as ET
import cueillette_outils as CU
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

def carte(pg, sel='.carte'):
    """le texte d'une carte de l'établi (dans son cadre)"""
    fr = ET.cadre(pg)
    return fr.evaluate("(s) => { var c = document.querySelector(s); return c ? c.innerText.replace(/\\s+/g, ' ') : ''; }", sel) if fr else ''

def etat_pl(pg):
    return pg.evaluate("() => { var P = M.P(); return {plantes:P.plantes || {}, fioles:Object.keys(P.vus).filter(function(k){ return k.indexOf('fiole:') === 0; }).map(function(k){ return k.slice(6); })}; }")

with sync_playwright() as p:
    b = p.chromium.launch()
    # ======================================================================== le matin
    print('— Le matin : les missions, l\'atelier, le gâteau')
    pg = debut(b, 'Alchi', 'alchimiste')
    R = pg.evaluate("() => window.PLANTES_RECETTES")
    verifier(pg.evaluate("() => M.E().id === 3 && M.etabliDispo() && M.laboDispo()"), 'enquête 3, Alchimiste : l\'établi et le labo sont branchés')
    mi = pg.evaluate("() => M.etapesMission().map(function(m){ return m.t; })")
    # (13 novembre : « on en dit trop ») plus de mission « Analyse la lettre », ni de mission de la nuit
    verifier(len(mi) >= 5 and 'gâteau' in mi[0] and 'sept plantes' in mi[1] and 'Anselme' in mi[2] and 'tisane' in mi[3] and 'sept potions' in mi[4] and not any('lettre' in m and 'QUI' not in m for m in mi), f'ses missions (celle de la tisane d\'Anselme n\'arrive qu\'après Bertille ; plus de « Analyse la lettre ») ({len(mi)} lignes)')
    atelier(pg)
    verifier(pg.evaluate("() => M.S.atelier.objets.filter(function(o){ return o.t === 'etabli'; }).length") == 1 and pg.locator('#atelier-ici .at-etabli-p').count() == 1, 'l\'établi des plantes est dans l\'atelier')
    verifier(signe(pg) == '', 'pas de signe au-dessus de l\'établi : aucune plante n\'attend')
    shot(pg, 'atelier')
    pts = lieu(pg, 'boulangerie')
    verifier(pts == ['gateau'] and 'Rien à trouver' not in texte(pg), f'la boulangerie : le gâteau de la fête (et pas de « rien à trouver ») ({pts})')
    info = jouer(pg, 'gateau', True, 'gateau', {'gateau': {'etages': 3}})
    verifier(info and info['type'] == 'gateau', 'le gâteau : le mini-jeu « gateau »')
    verifier('grande table de la fête' in texte(pg) and pg.evaluate("() => M.P().vus['alchimiste:boulangerie:gateau'] === 'ok' && !!M.P().gateau"), 'réussi : « Ton gâteau part sur la grande table de la fête », et le gâteau est gardé')
    fermer(pg)
    verifier(lieu(pg, 'mairie') == [], 'la mairie, le matin : rien pour l\'Alchimiste (le gâteau se porte l\'après-midi)')
    # ---------- les cueillettes (12 novembre, Bible §13.26 : sept endroits cachés de la carte ; le robot qui les touche au doigt : e3-cueillette.py) ----------
    print('— Le matin : les cueillettes')
    # (13 novembre) les ingrédients de l'enquête 2 se cueillent encore (la potion de vérité se prépare à l'enquête 3) : « Chercher » au
    # lavoir, à l'herboristerie, à la clairière, au potager ; le moulin n'a rien
    for l in ['lavoir', 'herboristerie', 'clairiere', 'potager']:
        pts = lieu(pg, l)
        verifier(pts == [] and pg.locator('#voile [data-act=cueillir]').count() == 1, f'{l} : « Chercher des ingrédients » (ceux de l\'enquête 2), pas de point à explorer ({pts})')
    pts = lieu(pg, 'moulin')
    verifier(pts == [] and pg.locator('#voile [data-act=cueillir]').count() == 0, f'moulin : rien à chercher ({pts})')
    # (12 novembre, 15 h 39, Bible §13.28 : trois plantes au village — l'oseille, le souci, le lin —, quatre au-delà de la brume, dont la mélisse)
    for k, mot in [('oseille', 'oseille')]:
        t = CU.cueillir(pg, k)
        verifier(t is not None and mot in t and 'établi' in t and pg.evaluate(f"() => M.plantes().{k}") == 1, f'{mot} : son endroit caché, « Cueillir », « sur l\'établi de ton atelier » ({(t or "")[:70]})')
    verifier(CU.cueillir(pg, 'oseille') is None and pg.evaluate("() => M.plantes().oseille") == 1, 'l\'oseille une deuxième fois ce matin : déjà cueillie')
    for k in ['souci', 'lin']:
        verifier(CU.cueillir(pg, k) is None and not pg.evaluate(f"() => M.plantes().{k} || 0"), f'{k} : pas avant l\'après-midi')
    for k in CU.LOIN:
        verifier(CU.cueillir(pg, k) is None and not pg.evaluate(f"() => M.plantes().{k} || 0"), f'{k} : au-delà de la brume, hors d\'atteinte sans Bertille')
    verifier(CU.tisane(pg) is None, 'pas de mélisse à porter à Anselme tant qu\'on n\'en a pas')
    t = CU.bertille(pg)
    verifier(t is not None and 'Bertille' in t and 'tisane de mélisse' in t and pg.evaluate("() => M.brumeLevee().join()") == 'n,o', 'au clocher : Anselme veut une tisane de mélisse, il sonne Bertille, la brume du nord et de l\'ouest recule')
    for k, mot in [('melisse', 'mélisse'), ('lycopode', 'lycopode'), ('vesse', 'vesse-de-loup')]:
        t = CU.cueillir(pg, k)
        verifier(t is not None and mot in t and pg.evaluate(f"() => M.plantes().{k}") == 1, f'{mot} : cueilli au-delà de la brume')
    # (Romain, 13 h 52, Bible §13.25) la tringle de l'établi n'a que trois places : la quatrième plante cueillie attend devant la porte de l'atelier
    verifier('devant la porte' in t and 'tringle' in t, f'la quatrième plante : « ça t\'attend devant la porte de ton atelier. La tringle de l\'établi est pleine ! » ({t[-80:]})')
    atelier(pg)
    verifier(signe(pg) == '🌿 3 à préparer !', f'quatre plantes cueillies, trois places sur la tringle : le signe dit « 🌿 3 à préparer ! » ({signe(pg)})')
    verifier(pg.locator('.at-plantes-porte').count() == 1 and pg.evaluate("() => M.plantesPorte().length") == 1 and pg.locator('.at-plantes-porte .pl-dessin').count() == 1, 'la quatrième attend devant la porte de l\'atelier (un panier, dans la rangée de la cueillette)')
    shot(pg, 'atelier-porte')
    pg.locator('.at-plantes-porte').click(force=True); pg.wait_for_timeout(400)
    tt = pg.evaluate("() => { var t = document.querySelector('.at-toast'); return t && !t.hidden ? t.innerText.replace(/\\s+/g, ' ') : ''; }")
    verifier('plus de place' in tt and pg.evaluate("() => M.plantesPorte().length") == 1 and pg.locator('.at-toast .at-toast-lire').count() == 1, f'on touche le panier : « il n\'y a plus de place », avec son 🔊, et elle reste devant la porte ({tt[:70]})')
    t = CU.cueillir(pg, 'gui')
    verifier(t is not None and 'gui' in t and pg.evaluate("() => M.plantes().gui") == 1, 'le gui : cueilli au-delà de la brume')
    # la tisane d'Anselme : on lui rapporte de la mélisse (et on garde la sienne pour l'établi)
    or0 = pg.evaluate("() => M.S.or")
    t = CU.tisane(pg)
    verifier(t is not None and 'CITRON' in t and pg.evaluate("() => M.S.or") == or0 + 3 and pg.evaluate("() => M.plantes().melisse") == 1 and pg.evaluate("() => !!M.P().vus['alchimiste:clocher:tisane']"), f'la mélisse rapportée à Anselme : trois pièces d\'or, et la plante reste à l\'Alchimiste ({(t or "")[:60]})')
    # (le souci et le lin : l'après-midi ; le robot avance l'heure le temps de les cueillir, pour faire les sept potions d'une traite)
    pg.evaluate("() => { M.P().moment = 1; }")
    for k, mot in [('souci', 'souci'), ('lin', 'lin')]:
        t = CU.cueillir(pg, k)
        verifier(t is not None and mot in t and pg.evaluate(f"() => M.plantes().{k}") == 1, f'{mot}, l\'après-midi : cueilli')
    pg.evaluate("() => { M.P().moment = 0; M.sauver(); M.render(); }")
    verifier(pg.evaluate("() => ['oseille','souci','melisse','lin','lycopode','vesse','gui'].every(function(k){ return !!M.P().vus['plante:' + k]; })"), 'les sept plantes sont cueillies')
    # ======================================================================== l'établi
    print('— L\'établi des plantes')
    atelier(pg)
    verifier(signe(pg) == '🌿 3 à préparer !' and pg.evaluate("() => M.plantesPorte().length") == 4 and pg.locator('.at-plantes-porte .pl-dessin').count() == 4, f'sept plantes cueillies : trois sur la tringle, quatre devant la porte ({signe(pg)})')
    shot(pg, 'atelier-signe')
    # (au doigt : l'établi, ses trois bulles, la jaune)
    pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-et-signe'); e.dispatchEvent(new PointerEvent('pointerdown', {bubbles:true})); e.dispatchEvent(new PointerEvent('pointerup', {bubbles:true})); e.click(); }"); pg.wait_for_timeout(700)
    bulles = pg.locator('#atelier-ici .at-bulle-pa')
    if bulles.count() == 0:
        pg.locator('#atelier-ici .at-et-signe').click(force=True); pg.wait_for_timeout(700); bulles = pg.locator('#atelier-ici .at-bulle-pa')
    verifier(bulles.count() == 3 and 'Préparer' in bulles.first.inner_text(), f'toucher le signe : les trois bulles de l\'établi, la jaune « 🌿 Préparer » ({bulles.count()})')
    shot(pg, 'bulles')
    # (pour la suite du robot : le lin, le pied-de-loup et la vesse-de-loup sur la tringle ; les quatre autres devant la porte)
    pg.evaluate("() => { var P = M.P(); M.plantesEnAttente(); P.tringle = ['lin', 'lycopode', 'vesse']; P.plPorte = {gui:1, oseille:1, souci:1, melisse:1}; M.sauver(); }")
    ET.vite(pg)
    if bulles.count(): bulles.first.click(force=True); pg.wait_for_timeout(600)
    if not pg.locator('#etabli-cadre').count(): echecs.append('la bulle jaune n\'a pas ouvert l\'établi')
    fr = ET.ouvrir(pg)
    verifier(ET.intro(pg) and fr.locator('.carte.intro .b-jaune').count() == 1 and fr.locator('.carte.intro figure svg').count() == 4 and ET.sans_son(pg, '.carte.intro') == [],
             'la première fois : l\'explication en quatre images, chaque phrase avec son 🔊, et son bouton jaune')
    shot(pg, 'etabli-intro')
    avant = pg.evaluate("() => window.__lus.length")
    fr.locator('.carte.intro .b-son').first.click(force=True); pg.wait_for_timeout(200)
    verifier(avant == 0 and pg.evaluate("() => window.__lus.length") == 1, 'un 🔊 lit sa phrase (et rien ne se lit tout seul)')
    ET.fermer_intro(pg)
    verifier(pg.evaluate("() => !!M.S.etabliIntro") and not ET.intro(pg), 'le bouton jaune « 🌿 À l\'établi ! » : l\'explication ne reviendra pas')
    verifier(fr.locator('#etagere-plantes .pendue').count() == 3 and fr.locator('#scene .plante .corps').count() == 0 and fr.locator('#g-sac').count() == 0 and fr.locator('#scene .outil').count() >= 9 and fr.locator('#portique [id^=potion-]').count() == 7 and fr.locator('#scene [id^=potion-].pleine').count() == 0 and fr.evaluate("() => document.querySelector('#potion-givre').style.display") == 'none',
             'l\'établi : trois plantes pendues à la tringle (les autres attendent à la porte), le linge vide, les outils sur la table, sept flacons vides sur l\'étagère (celui du givre n\'est pas là : sa fleur n\'est pas arrivée), plus de sac')
    shot(pg, 'etabli')
    # ---------- on se trompe ----------
    ET.outil(pg, 'planche'); verifier(len(ET.texte(pg)) > 12 and ET.etat(pg)['ou'] is None and fr.locator('#calque .bulle-o .b-son').count() == 1, f'un outil touché les mains vides : il dit à quoi il sert, avec son 🔊 ({ET.texte(pg)[:50]})')
    ET.plante(pg, 'lin', 'fleurs'); verifier(ET.etat(pg)['partie'] == 'fleurs', 'on regarde le lin de près, on prend ses fleurs bleues')
    ET.outil(pg, 'tamis'); ET.outil(pg, 'tamis')
    verifier('fleurs bleues' in ET.texte(pg) and ET.etat(pg)['partie'] is None and pg.evaluate("() => M.plantes().lin") == 1, f'la mauvaise partie : une phrase vraie, et la plante revient entière ({ET.texte(pg)[:60]})')
    shot(pg, 'faux-partie')
    ET.plante(pg, 'lin', 'graines'); ET.outil(pg, 'mortier'); ET.outil(pg, 'mortier')
    verifier('farine' in ET.texte(pg) and ET.etat(pg)['n'] == 0 and ET.etat(pg)['ou'] == 'mortier', f'le mauvais outil : ce qui se passe pour de vrai, et rien n\'est perdu ({ET.texte(pg)[:50]})')
    shot(pg, 'faux-outil')
    ET.porte(pg, 'huilier'); verifier('Vide' in ET.texte(pg) and ET.etat(pg)['H'] is None, f'la bouteille d\'huile de lin est vide tant que l\'huile n\'est pas faite ({ET.texte(pg)[:50]})')
    verifier(etat_pl(pg)['fioles'] == [], 'et rien n\'est fait')
    # ---------- on quitte au milieu, on revient : la préparation est gardée ----------
    ET.outil(pg, 'tamis'); ET.outil(pg, 'tamis')
    verifier(ET.etat(pg)['n'] == 1, f'les graines sont triées au tamis ({ET.texte(pg)[:50]})')
    ET.quitter(pg)
    verifier(pg.locator('#etabli-cadre').count() == 0 and pg.evaluate("() => { var e = M.P().etabli; return !!e && e.p === 'lin' && e.n === 1; }"), 'on quitte au milieu : la préparation est gardée dans la sauvegarde')
    fr = ET.ouvrir(pg)
    verifier(not ET.intro(pg) and ET.etat(pg)['plante'] == 'lin' and ET.etat(pg)['n'] == 1 and ET.etat(pg)['ou'] == 'tamis', 'on revient : pas d\'explication, et les graines attendent au tamis')
    # ---------- les sept potions, geste par geste (l'huile avant le baume) ----------
    for pid in ['huile', 'feu', 'fumigene', 'colle', 'acide', 'baume', 'coeur']:
        r = R['RE'][pid]
        if pid == 'huile':
            # (elle est déjà en route : il reste le pressoir, le filtre, la fiole)
            ET.outil(pg, 'presse'); ET.outil(pg, 'presse'); ET.outil(pg, 'filtre'); ET.outil(pg, 'fiole')
            for _ in range(40):
                if ET.etat(pg)['mode'] == 'prete': break
                pg.wait_for_timeout(100)
            fait = pid in ET.etat(pg)['faites']
        else:
            fait = ET.faire(pg, pid, R)
            fr = ET.cadre(pg)        # (ET.faire a pu sortir chercher la plante devant la porte : le cadre est neuf)
        t = carte(pg, '.carte.prete')
        if pid == 'huile': shot(pg, 'huile-prete')
        e = etat_pl(pg)
        verifier(fait and pid in e['fioles'] and e['plantes'].get(r['plante']) == 0 and "C'est vrai" in t and r['vrai'][:24] in t and ET.sans_son(pg, '.carte.prete') == [],
                 f'{r["nom"]} : {len(r["etapes"])} étapes, la fiole est sur l\'étagère, et la carte « C\'est vrai ! » ({t[:50]})')
        if pid == 'coeur':
            verifier('tout est prêt' in t, 'la septième : « tout est prêt ! »')
            ET.continuer(pg); t2 = carte(pg)
            verifier(ET.etat(pg)['mode'] == 'sac' and fr.locator('#sacCode').count() == 1 and fr.locator('.carte .rang .pleine').count() == 7 and 'Pisteur' in t2 and ET.sans_son(pg, '.carte') == [] and fr.locator('.carte [data-donjon]').count() == 0,
                     f'« Continuer » : le code des sept potions pour le Pisteur, avec son 🔊 (et rien sur le donjon, le jour) ({t2[:60]})')
            shot(pg, 'code')
            ET.fermer_mode(pg)
        else:
            verifier(ET.continuer(pg) and ET.etat(pg)['mode'] is None, f'{r["nom"]} : le bouton jaune « Continuer »')
        if pid == 'huile':
            # une place s'est libérée sur la tringle : dans l'atelier, on touche le panier devant la porte
            ET.quitter(pg); pg.wait_for_timeout(300)
            pg.locator('.at-plantes-porte').click(force=True); pg.wait_for_timeout(400)
            tt = pg.evaluate("() => { var t = document.querySelector('.at-toast'); return t && !t.hidden ? t.innerText.replace(/\\s+/g, ' ') : ''; }")
            verifier('se pendre' in tt and pg.evaluate("() => M.P().tringle.length") == 3 and pg.evaluate("() => M.plantesPorte().length") == 3 and pg.locator('.at-plantes-porte .pl-dessin').count() == 3,
                     f'une potion faite, une place libre : on touche le panier devant la porte, une plante va se pendre ; trois attendent encore ({tt[:70]})')
            fr = ET.ouvrir(pg)
            verifier(fr.locator('#etagere-plantes .pendue').count() == 3, 'de retour à l\'établi : trois plantes sur la tringle')
    verifier(fr.locator('#scene [id^=potion-].pleine').count() == 7, 'les sept flacons sont pleins sur l\'étagère')
    shot(pg, 'sept-potions')
    verifier(fr.locator('#scene .pendue').count() == 0 and fr.locator('#scene .plante .corps').count() == 0, 'plus une plante sur la tringle ni sur le linge : tout est en fiole')
    # ---------- le grimoire ----------
    ET.livre(pg)
    ok = ET.etat(pg)['mode'] == 'livre'
    for pid in R['ORDRE']:
        fr.locator(f'.livre .signet[data-page={pid}]').click(force=True); pg.wait_for_timeout(120)
        r = R['RE'][pid]; t = carte(pg, '#pagesLivre'); muets = ET.sans_son(pg, '#pagesLivre')
        if muets or r['recette'][0][:18] not in t or r['dit'][:18] not in t or r['sert'][:20] in t or 'donjon' in t.lower() or fr.locator('#pagesLivre .planche-b svg').count() != 1 or fr.locator('#pagesLivre .page.d svg').count() != 1:
            ok = False; print('     page', pid, muets, t[:80])
    verifier(ok, 'le grimoire : sept pages (la plante dessinée, la partie en mots, la recette en phrases, sans image d\'outil), chaque texte avec son 🔊')
    shot(pg, 'grimoire')
    tg = carte(pg, '#pagesLivre')
    ET.fermer_mode(pg)
    ET.code(pg)
    verifier(ET.etat(pg)['mode'] == 'sac' and fr.locator('#sacCode').count() == 1, 'toucher l\'étagère des potions : on revoit le code')
    ET.quitter(pg)
    verifier(pg.locator('#etabli-cadre').count() == 0 and signe(pg) == '' and not pg.evaluate("() => !!(M.P().etabli && M.P().etabli.p)"), 'retour à l\'atelier : plus de signe au-dessus de l\'établi, plus rien en route')
    notes = pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')")
    verifier('Les sept potions sont prêtes' in notes and 'acide' in notes and 'donjon' not in notes.lower() and 'monstre' not in notes.lower(), 'au Carnet : les potions prêtes, sans un mot du donjon')
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
    clic('#ech-lettre'); pg.wait_for_timeout(400); clic('#gLoupe'); pg.wait_for_timeout(3400)
    # (13 novembre : « il ne trouvait pas le Livre d'or ») avec le code du Sage, le Livre d'or s'ouvre tout seul sous la lettre
    shot(pg, 'loupe-lettre')
    verifier(f.locator('[data-ech^="ecritures:"]').count() == 12, 'le Livre d\'or s\'ouvre tout seul sous la lettre : douze écritures')
    shot(pg, 'livre-dor')
    clic('[data-ech="ecritures:victor"]'); pg.wait_for_timeout(1300); shot(pg, 'compare-victor'); pg.wait_for_timeout(1800)
    verifier(etat()['barres'].get('lettre', {}).get('ecritures:victor') and not etat()['trouves'].get('lettre'), 'Victor (deux signes sur trois) : ce n\'est pas lui, il est barré')
    # (13 novembre) DEUX écritures ont les trois signes : Mélusine et Margot — l'une ou l'autre, le labo annonce les deux
    clic('[data-ech="ecritures:margot"]'); pg.wait_for_timeout(2600)
    rub = f.evaluate("() => document.querySelector('#ruban').textContent")
    verifier(etat()['trouves'].get('lettre') and 'Mélusine' in rub and 'Margot' in rub, f'Margot : les trois signes… comme Mélusine : « {rub} »')
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
    verifier('Mélusine' in t and 'Margot' in t and pg.locator('#voile .b-donne, #voile .b-code').count() >= 1 and pg.evaluate("() => !!M.P().analyses.lettre"), 'en sortant : la découverte (Mélusine… et Margot), et le code « Deux écritures »')
    shot(pg, 'decouverte-ecriture')
    fermer(pg)
    notes = pg.evaluate("() => M.P().carnet.map(function(n){ return n.t; }).join(' | ')")
    verifier('lavande' in notes and 'noix de galle' in notes and 'colporteur' not in notes and 'Mélusine' in notes and 'Margot' in notes, 'au Carnet : le pollen de lavande, l\'encre de noix de galle (plus « de colporteur » : c\'est celle d\'Iris), les deux écritures (Mélusine, Margot)')
    pts = lieu(pg, 'mairie')
    verifier(pts == ['gateau'], f'la mairie, l\'après-midi : porter le gâteau au maire ({pts})')
    or0 = pg.evaluate("() => M.S.or")
    pg.locator('#voile [data-act=point][data-id=gateau]').click(); pg.wait_for_timeout(250)
    verifier('clou de ma fête' in texte(pg) and 'minuit' not in texte(pg) and pg.evaluate("() => M.S.or") == or0 + 5, 'le maire : « Ce sera le clou de ma fête », plus de minuit, et cinq pièces d\'or')
    fermer(pg)
    fait = pg.evaluate("() => { M.majMission(); return Object.keys(M.P().mission.faits).length; }")
    verifier(fait == 5, f'ses cinq missions sont validées, la tisane d\'Anselme comprise ({fait})')
    # ======================================================================== la nuit : le sac
    print('— La nuit : le sac')
    code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    atelier(pg)
    verifier(signe(pg) == '', f'au-dessus de l\'établi : rien, le code a déjà été montré ({signe(pg)})')
    shot(pg, 'nuit-signe')
    fr = ET.ouvrir(pg)
    ET.code(pg)
    t = carte(pg)
    verifier(fr.locator('#sacCode').count() == 1 and 'Pisteur' in t and ET.sans_son(pg, '.carte') == [], f'la nuit : le code des sept potions pour le Pisteur, et le 🔊 ({t[:60]})')
    shot(pg, 'sac')
    # (13 novembre) le code des sept potions est le CODE D'ALLURE de l'Alchimiste (descente.js) : plus de code du sac
    moi = pg.evaluate("() => M.allureCode()"); seq7 = pg.evaluate("(id) => M.code(id)", moi); bits = pg.evaluate("() => M.sacBits()")
    verifier(bits == 127 and len(seq7) == 3 and moi.startswith('allure:') and fr.locator('#sacCode .formes').inner_text() == pg.evaluate("(q) => q.map(function(s){ return DONNEES.SYM[s].e; }).join('')", seq7),
             f'sept potions : l\'établi montre le code d\'allure de l\'Alchimiste ({moi}, {seq7})')
    ET.quitter(pg)
    verifier(signe(pg) == '', 'le code est montré : le signe s\'en va')
    t = code(pg, moi)
    verifier('Pisteur' in t or 'équipier' in t, f'l\'Alchimiste ne peut pas taper son propre code ({t[:50]})')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()), vus = {}, n = 0; Object.keys(c.parId).forEach(function(id){ var k = c.parId[id].join('-'); if(vus[k]) n++; vus[k] = 1; }); return n; }") == 0, 'aucun code de l\'enquête 3 n\'est en double (les 216 codes d\'allure compris)')
    # ---------- le Pisteur tape le code ----------
    pp = debut(b, 'Pisteur', 'pisteur')
    code(pp, 'moment:1'); code(pp, 'moment:2')
    seq = pp.evaluate("(id) => M.code(id)", moi)
    verifier(seq == seq7, 'les deux tablettes ont le même code')
    t = code(pp, moi, True)
    verifier('L\'Alchimiste est prêt' in t and pp.locator('#voile .pl-fiole.pl-pleine').count() == 7 and pp.evaluate("() => (M.sacPotions() || []).join(',')") == 'feu,fumigene,huile,colle,acide,baume,coeur',
             f'le Pisteur tape le code : l\'Alchimiste est prêt, ses sept potions sont du voyage ({t[:60]})')
    verifier(pp.evaluate("() => { var a = M.P().allures.alchimiste; return !!a && !!M.P().vus['sac:acide']; }"), 'il connaît l\'allure de l\'Alchimiste, et il a l\'acide (la grille du puits)')
    pp.screenshot(path=f'{OUT}/pisteur-sac.png'); fermer(pp)
    pp.close()
    # ---------- téléphone couché : l'établi tient dans l'écran ----------
    pg.set_viewport_size({'width': 780, 'height': 360}); pg.wait_for_timeout(300)
    fr = ET.ouvrir(pg)
    debord = fr.evaluate("""() => { var W = innerWidth, H = innerHeight, bad = [];
      [].forEach.call(document.querySelectorAll('#scene .outil > rect[fill=transparent], #scene .plante .prise, #gLivre > rect[fill=transparent], #bQuitter'), function(e){
        var q = e.getBoundingClientRect(), id = (e.closest('[id]') || e).id;
        if(q.left < -1 || q.top < -1 || q.right > W + 1 || q.bottom > H + 1) bad.push(id + ' dépasse');
        else if(q.width < 24 || q.height < 24) bad.push(id + ' trop petit'); });
      return bad; }""")
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
