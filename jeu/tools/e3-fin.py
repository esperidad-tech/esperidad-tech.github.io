"""Enquête 3, étape 7 (Bible § 13.14) : l'accusation et la fin animée (Playwright).

  le Barde : « Léo attrapé » ouvre le grand dialogue ; trois étapes réussies → « ✨ La suite », le code « Léo a tout dit » pour le Sage
    (+10 pièces d'or) ; deux étapes → « Léo : Elle est sous le clocher » ; aucune → pas de code ; « Léo s'est enfui » : pas de code ;
  le Sage : il reçoit « Ce que Léo a dit » ; l'accusation (QUI : Mélusine, OÙ : sous le clocher) ; une mauvaise accusation coûte un
    cœur ; la question du Corbeau (son 🔊, trois suspects, aucun cœur) : la réponse reste secrète (la même phrase, juste ou pas) ;
    le code de fin porte la variante de la scène finale ; la fin : six images, chacune avec son 🔊, cinq petites scènes animées
    (la porte, minuit, le maire et Léo, la bague, les gardes) puis le cachot et sa plume noire ; la réplique du maire change selon ce
    que Léo a dit ; le calepin de fin ;
  les autres tablettes : le code de fin du Sage donne la même variante (et le code simple, la scène sans Léo) ;
  l'enquête 2 : ses codes de fin n'ont pas bougé.
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-fin.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'e3-fin'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom, attendre=400):
    n[0] += 1; pg.wait_for_timeout(attendre); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e && !e.hidden ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle, garder=False, seq=None):
    seq = seq or pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(450)
    t = texte(pg)
    if not garder: fermer(pg)
    return t

def sans_son(pg, sel='#voile'):
    return pg.evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p'), function(p){
        if(p.classList.contains('doux')) return;
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var a = p.querySelector('.b-lire') || (p.nextElementSibling && p.nextElementSibling.classList.contains('b-lire') ? p.nextElementSibling : null);
        if(mots > 3 && !a) r.push(t.slice(0, 50)); });
      return r; }""", sel)

def debut(b, nom, role, enquete=3):
    pg = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click(f'[data-act=mode-test][data-i="{enquete}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    return pg

def nuit_sage(pg):
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)

def accuser(pg, qui, ou):
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    pg.locator(f'#voile [data-act=acc-choix][data-k=qui][data-v={qui}]').click(); pg.wait_for_timeout(200)
    pg.locator(f'#voile [data-act=acc-choix][data-k=ou][data-v={ou}]').click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=acc-valider]').click(); pg.wait_for_timeout(350)

def leo(pg, bons):
    """le grand dialogue de Léo : « Continuer », puis `bons` bonnes réponses, puis une mauvaise (s'il en reste)"""
    X = pg.evaluate("() => M.E().grands.leo.etapes.map(function(e){ return e.choix.map(function(c){ return !!c.bon; }); })")
    pg.locator('#voile [data-act=gd-leo-suite]').click(); pg.wait_for_timeout(250)
    for e in range(3):
        k = X[e].index(True) if e < bons else X[e].index(False)
        pg.locator(f'#voile [data-act=gd-choix][data-k="{k}"]').click(); pg.wait_for_timeout(350)
        if e >= bons: break

def diapo(pg):
    return pg.evaluate("""() => { var a = document.querySelector('.b-fin-slide'); if(!a) return null;
      return {n:+a.dataset.n, t:a.querySelector('p').textContent, son:!!a.querySelector('.b-lire'), scene:(a.querySelector('.sf-scene') || {className:''}).className,
        gens:a.querySelectorAll('.sf-gens').length, gardes:a.querySelectorAll('.sf-garde').length, bulles:[].map.call(a.querySelectorAll('.sf-bulle'), function(b){ return b.textContent; }),
        prison:!!a.querySelector('.b-prison'), plume:!!a.querySelector('.b-prison-plume'), points:document.querySelectorAll('.b-points i').length}; }""")

def histoire(pg, nom, capt=True):
    """toute la fin, image par image : rend la liste des diapos"""
    l = []
    for i in range(12):
        d = diapo(pg)
        if not d: break
        l.append(d)
        if capt: shot(pg, f'{nom}-{i + 1}', 2600 if i < 5 else 7400)
        pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    return l


with sync_playwright() as p:
    b = p.chromium.launch()
    # ======================================================================== le Barde et Léo
    print('— Le Barde : ce que Léo a dit')
    attendu = {3: 'info:leo_dit3', 2: 'info:leo_dit2', 1: 'info:leo_dit1', 0: None}
    for bons in (3, 2, 0):
        pg = debut(b, 'Barde', 'barde')
        code(pg, 'moment:1'); code(pg, 'moment:2')
        or0 = pg.evaluate("() => M.S.or")
        t = code(pg, 'info:leo_attrape', True)
        verifier(pg.locator('#voile [data-act=gd-leo-ment]').count() == 1, f'[{bons}] « Léo attrapé » : le grand dialogue s\'ouvre tout de suite')
        leo(pg, bons)
        cd = attendu[bons]
        if cd:
            verifier(pg.locator('#voile [data-act=gd-leo-code]').count() == 1 and pg.evaluate(f"() => !!M.P().objets['_{cd}']"), f'[{bons}] à la fin : « ✨ La suite », et le code {cd} est gardé pour le Sage')
            if bons == 3: verifier(pg.evaluate("() => M.S.or") == or0 + 10 and '+10' in texte(pg), '[3] dix pièces d\'or')
            shot(pg, f'barde-leo-{bons}')
            pg.locator('#voile [data-act=gd-leo-code]').click(); pg.wait_for_timeout(350)
            t = texte(pg)
            verifier('Ce que Léo a dit' in t and 'donne son code au Sage' in t and pg.locator('#voile .b-donne, #voile .b-code').count() >= 1 and not sans_son(pg), f'[{bons}] la découverte : le code pour le Sage, et le 🔊 ({t[:50]})')
            shot(pg, f'barde-code-{bons}')
        else:
            verifier(pg.locator('#voile [data-act=gd-leo-code]').count() == 0 and 'Léo n\'a rien voulu dire' in texte(pg) and pg.evaluate("() => !Object.keys(M.P().objets).some(function(k){ return k.indexOf('_info:leo_dit') === 0; })"), '[0] aucune étape : pas de code, « Léo n\'a rien voulu dire… »')
        pg.context.close()
    pg = debut(b, 'Barde', 'barde')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    t = code(pg, 'info:leo_enfui', True)
    verifier('Léo s\'est enfui' in t and 'rien voulu dire' in t and pg.evaluate("() => !Object.keys(M.P().objets).some(function(k){ return k.indexOf('_info:leo_dit') === 0; })"), '« Léo s\'est enfui » : la scène, pas de code pour le Sage')
    pg.context.close()

    # ======================================================================== le Sage : Léo a tout dit
    print('— Le Sage : l\'accusation, le Corbeau, la fin (Léo a tout dit)')
    pg = debut(b, 'Sage', 'sage')
    nuit_sage(pg)
    verifier(pg.evaluate("() => M.finVariante()") == 0 and pg.evaluate("() => M.idVictoire(0)") == 'victoire:0', 'sans rien de Léo : la variante 0, le code de fin simple')
    t = code(pg, 'info:leo_dit3', True)
    verifier('Léo a tout dit' in t and 'bague à tête de corbeau' in t and not sans_son(pg), f'le Sage reçoit « Léo a tout dit » ({t[:50]})')
    fermer(pg)
    verifier(pg.evaluate("() => M.finVariante()") == 2 and pg.evaluate("() => M.idVictoire(1)") == 'victoire:21', 'la variante 2 : le code de fin la portera')
    c0 = pg.evaluate("() => M.coeurs()")
    accuser(pg, 'margot', 'clocher')
    verifier('pas ça' in texte(pg) and pg.evaluate("() => M.coeurs()") == c0 - 1, 'une mauvaise accusation (Margot) : un cœur de moins'); fermer(pg)
    accuser(pg, 'melusine', 'clocher')
    t = texte(pg)
    verifier('QUI est le Corbeau' in t and pg.locator('#voile [data-act=corbeau-choix]').count() == 3 and 'aucun cœur' in t and not sans_son(pg), f'la bonne accusation : la question du Corbeau, trois suspects, son 🔊 ({t[:60]})')
    shot(pg, 'corbeau')
    pg.locator('#voile [data-act=corbeau-choix][data-v=silas]').click(); pg.wait_for_timeout(350)
    t = texte(pg)
    verifier('encre secrète' in t and 'Tu as vu juste' not in t and pg.locator('#voile .b-corbeau-rep.ok').count() == 0 and pg.evaluate("() => M.P().corbeau") == 'silas' and pg.evaluate("() => M.coeurs()") == c0 - 1, 'la réponse reste secrète (pas de « bravo », pas de cœur perdu), elle est gardée')
    seq = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .b-code-sym, #voile .b-sym, #voile [data-sym]'), function(e){ return e.textContent; }).join('')")
    att = pg.evaluate("() => M.code('victoire:21')")
    vu = pg.evaluate("() => { var c = M.codesEnquete(M.E()); return c.parCode[M.code(M.idVictoire(1)).join('-')]; }")
    verifier(vu == 'victoire:21' and len(att) == 3, f'le code de fin montré : une erreur, la variante 2 ({vu})')
    shot(pg, 'victoire')
    pg.locator('#voile [data-act=fin-sage]').click(); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.P().fin.variante") == 2 and pg.evaluate("() => M.P().fin.erreurs") == 1, 'la fin commence : la variante 2, une erreur')
    verifier(pg.locator('.b-code-fin').count() == 1 and pg.evaluate("() => { var c = M.codesEnquete(M.E()); return c.parCode[M.code(M.idVictoire(M.P().fin.erreurs, M.P().fin.variante)).join('-')]; }") == 'victoire:21', 'pendant l\'histoire, le Sage garde le code de fin sous la main')
    D = histoire(pg, 'sage')
    verifier(len(D) == 6 and all(d['points'] == 6 for d in D), f'six images ({len(D)})')
    verifier(all(d['son'] for d in D), 'chaque image a son 🔊')
    verifier([d['scene'].split('sf-e3-')[-1].split(' ')[0] if 'sf-e3-' in d['scene'] else '' for d in D] == ['porte', 'minuit', 'leo', 'bague', 'gardes', ''], f'cinq petites scènes animées, dans l\'ordre ({[d["scene"][-12:] for d in D]})')
    verifier('beaucoup trop parlé' in D[2]['t'] and any('trop parlé' in x for x in D[2]['bulles']) and D[2]['gens'] == 3, f'Léo a tout dit : « Toi… tu as beaucoup trop parlé, mon garçon. » ({D[2]["t"][:50]})')
    verifier(D[1]['gens'] == 6 and D[1]['gardes'] == 2 and 'DONG' in D[1]['t'], 'minuit : les quatre héros, le maire, Silas, deux gardes')
    verifier('bague en argent' in D[3]['t'] and 'Enfermez-les' in D[4]['t'] and D[4]['gardes'] == 2, 'la bague, puis « Gardes ! Enfermez-les ! »')
    verifier(D[5]['prison'] and D[5]['plume'] and 'À suivre' in D[5]['t'], 'la dernière image : le cachot, la plume noire, « À suivre… »')
    verifier(pg.evaluate("() => window.__lus.length") == 0, 'rien ne s\'est lu tout seul')
    cal = pg.evaluate("() => M.S.calepin.filter(function(c){ return c.e === 3; }).map(function(c){ return c.t; })")
    verifier(len(cal) == 6 and any('tête de corbeau' in c for c in cal) and any('quatre signes' in c for c in cal), f'le calepin de fin : six notes ({len(cal)})')
    verifier(pg.evaluate("() => M.P().fin.etape") == 'recompenses' and pg.locator('h1').first.inner_text() == 'Enquête résolue !', 'puis « Enquête résolue ! »')
    shot(pg, 'resolue')
    codeFin = att
    pg.context.close()

    # ======================================================================== les autres tablettes : le code de fin
    print('— Les autres tablettes : le code de fin')
    pg = debut(b, 'Pisteur', 'pisteur')
    code(pg, 'moment:1'); code(pg, 'moment:2')
    verifier(pg.evaluate("() => M.code('victoire:21')") == codeFin, 'le même code sur une autre tablette')
    code(pg, 'victoire:21', True); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.P().etape") == 'fin' and pg.evaluate("() => M.P().fin.variante") == 2 and pg.evaluate("() => M.P().fin.erreurs") == 1, 'le Pisteur tape le code de fin du Sage : la fin, la variante 2, une erreur')
    D = histoire(pg, 'pisteur', False)
    verifier(len(D) == 6 and 'beaucoup trop parlé' in D[2]['t'], 'sa scène finale est la même : « tu as beaucoup trop parlé »')
    pg.context.close()
    pg = debut(b, 'Alchi', 'alchimiste')
    code(pg, 'victoire:10', True); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.P().fin.variante") == 1 and pg.evaluate("() => M.P().fin.erreurs") == 0, 'un autre code de fin : la variante 1, sans erreur')
    D = histoire(pg, 'alchimiste-v1', False)
    verifier('Rentre au moulin' in D[2]['t'] and any('Rentre au moulin' in x for x in D[2]['bulles']), f'Léo a parlé à moitié : « Léo. Rentre au moulin. Tout de suite. » ({D[2]["t"][:40]})')
    pg.context.close()
    pg = debut(b, 'Barde', 'barde')
    code(pg, 'victoire:2', True); pg.wait_for_timeout(300)
    verifier(not pg.evaluate("() => M.P().fin.variante") and pg.evaluate("() => M.P().fin.erreurs") == 2, 'le code de fin simple : pas de variante, deux erreurs')
    pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(250); pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(250)
    d = diapo(pg)
    verifier('Tiens, tiens' in d['t'] and d['gens'] == 6 and any('Tiens' in x for x in d['bulles']), f'Léo n\'est pas là : « Tiens, tiens… Nos petits enquêteurs » ({d["t"][:40]})')
    shot(pg, 'barde-v0', 1500)
    pg.context.close()

    # ======================================================================== le Sage, variante 1, sans erreur ; le Corbeau deviné
    print('— Le Sage : Léo a parlé à moitié ; le Corbeau deviné')
    pg = debut(b, 'Sage', 'sage')
    nuit_sage(pg)
    code(pg, 'info:leo_dit2')
    accuser(pg, 'melusine', 'clocher')
    pg.locator('#voile [data-act=corbeau-choix][data-v=grosbec]').click(); pg.wait_for_timeout(350)
    t = texte(pg)
    verifier('encre secrète' in t and 'Tu as vu juste' not in t and pg.locator('#voile .b-corbeau-rep.ok').count() == 0, 'la bonne réponse au Corbeau : la même phrase, rien ne la trahit')
    verifier(pg.evaluate("() => { var c = M.codesEnquete(M.E()); return c.parCode[M.code(M.idVictoire(0)).join('-')]; }") == 'victoire:10', 'le code de fin : sans erreur, la variante 1')
    pg.locator('#voile [data-act=fin-sage]').click(); pg.wait_for_timeout(500)
    pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(250); pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(250)
    d = diapo(pg)
    verifier('Rentre au moulin' in d['t'], 'sa scène finale : « Léo. Rentre au moulin. »')
    shot(pg, 'sage-v1', 5200)
    pg.evaluate("() => M.archiver()")
    verifier(pg.evaluate("() => M.S.journal[3].corbeau") == 'grosbec', 'la réponse au Corbeau est gardée dans le journal, pour la suite de la saison')
    pg.context.close()

    # ======================================================================== l'enquête 2 : rien ne change
    print('— L\'enquête 2')
    pg = debut(b, 'Sage2', 'sage', 2)
    verifier(pg.evaluate("() => M.finVariante()") == 0 and pg.evaluate("() => M.idVictoire(2)") == 'victoire:2' and pg.evaluate("() => M.code('victoire:2').join('-')") == 'coeur-lune-flamme', 'enquête 2 : pas de variante, ses codes de fin n\'ont pas bougé')
    pg.context.close()
    b.close()

print()
if erreurs: print('ERREURS DE PAGE :'); [print('  ', e[:300]) for e in erreurs[:12]]
if echecs: print(f'{len(echecs)} ÉCHEC(S) :'); [print('  ✗', e) for e in echecs]
else: print('Tout est bon.')
sys.exit(1 if (echecs or erreurs) else 0)
