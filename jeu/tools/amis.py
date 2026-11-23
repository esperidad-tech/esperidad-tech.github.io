"""« 🤝 Mes amis » (Romain, 23 novembre, 12 h 46 et 13 h 10 ; Bible §13.97) — AU VRAI DOIGT (des clics, pas des raccourcis du programme).

  · Quatre tablettes créent leur héros, chacun avec une des NOUVELLES coiffures (afro, twists, macarons, rasé) et des âges différents ;
    juste après « C'est parti ! » : l'écran « Mes amis » — mon héros, mon code de six dessins, trois boutons (une ombre et un « ? »),
    le rond jaune sur le premier, le bouton jaune « En route pour Brumeval ! », pas de « ← Retour », un 🔊 sur chaque texte.
  · Chacun lit le code des autres SUR LEUR ÉCRAN et le tape au doigt : la fenêtre se ferme toute seule, le bouton passe au vert,
    l'ami est gardé avec toute son apparence (la nouvelle coiffure comprise).
  · Les erreurs : son propre code, le code d'un autre ami, six dessins au hasard ; « ⌫ Effacer » ; « Plus tard ».
  · Ensuite : « Toute l'équipe est là », « En route » mène au village ; le bouton 🤝 de l'écran du héros et le menu ☰ y ramènent
    (avec « ← Retour ») ; un bouton vert se retape ; les amis restent après un rechargement de la page.
  · L'enquête 3 : le Pisteur n'a plus aucun code à taper pour descendre (seulement les sept potions), l'allure des amis part au donjon
    (une nouvelle coiffure y devient celle d'avant qui lui ressemble) ; le Sage n'a plus « Montre ce code au Pisteur » en code
    obligatoire ; au cachot de la fin, les trois amis sont là tout de suite, sans pavé.
   BRUMEVAL_DIST=<dossier construit> python3 tools/amis.py"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'amis'); os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom, attendre=400):
    n[0] += 1; pg.wait_for_timeout(attendre); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png', full_page=True)

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def texte(pg, sel='#voile'):
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'); return e && !e.hidden ? e.innerText.replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def sans_son(pg, sel):
    """les textes de plus de trois mots sans leur bouton 🔊"""
    return pg.evaluate("""(sel) => { var r = [];
      [].forEach.call(document.querySelectorAll(sel + ' p'), function(p){
        var t = p.textContent.replace('🔊', '').trim(), mots = t.split(/\\s+/).filter(function(m){ return /[A-Za-zÀ-ÿ0-9]/.test(m); }).length;
        var a = p.querySelector('.b-lire') || (p.nextElementSibling && p.nextElementSibling.classList.contains('b-lire') ? p.nextElementSibling : null);
        if(mots > 3 && !a) r.push(t.slice(0, 50)); });
      return r; }""", sel)

HEROS = {
    'pisteur': {'sexe': 'f', 'age': 'adulte', 'peau': 'p3', 'coiffure': 'afro', 'cheveux': 'noir', 'yeux': 'ambre', 'barbe': 'aucune'},
    'alchimiste': {'sexe': 'm', 'age': 'adulte', 'peau': 'p5', 'coiffure': 'twists', 'cheveux': 'brun', 'yeux': 'vert', 'barbe': 'courte'},
    'barde': {'sexe': 'f', 'age': 'enfant', 'peau': 'p1', 'coiffure': 'macarons', 'cheveux': 'roux', 'yeux': 'bleu', 'barbe': 'aucune'},
    'sage': {'sexe': 'm', 'age': 'age', 'peau': 'p2', 'coiffure': 'rase', 'cheveux': 'blanc', 'yeux': 'gris', 'barbe': 'longue'},
}
TAILLES = {'pisteur': (390, 844), 'alchimiste': (1180, 820), 'barde': (820, 1180), 'sage': (1180, 820)}   # un téléphone, des tablettes

def creer(b, role, avec_amis=True):
    w, h = TAILLES[role]
    pg = b.new_context(viewport={'width': w, 'height': h}, has_touch=True).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.add_init_script(("window.BRUMEVAL_AVEC_AMIS = true;" if avec_amis else "") + " window.BRUMEVAL_SANS_TUTO = true; window.BRUMEVAL_SANS_DONJON = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]')
    pg.evaluate("(a) => { Object.assign(M.UI.crea, a); M.render(); }", HEROS[role])   # (préparer l'apparence : ce n'est pas ce qu'on vérifie ici)
    pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]'); pg.wait_for_timeout(400)
    return pg

def mon_code(pg):
    """le code tel qu'il est DESSINÉ sur l'écran « Mes amis » (les noms des dessins, puis leurs clés)"""
    return pg.evaluate("""() => { var noms = [].map.call(document.querySelectorAll('.am-moncode .b-sym'), function(e){ return e.getAttribute('aria-label'); });
      return noms.map(function(nm){ return DONNEES.ORDRE_SYM.filter(function(k){ return DONNEES.SYM[k].n === nm; })[0]; }); }""")

def taper(pg, seq):
    for s in seq:
        pg.locator(f'#voile [data-act=am-sym][data-s="{s}"]').click(); pg.wait_for_timeout(90)
    pg.wait_for_timeout(250)

def ami(pg, r):
    return pg.evaluate(f"() => M.S.amis && M.S.amis['{r}']")


with sync_playwright() as p:
    b = p.chromium.launch()
    # ======================================================================== les robots des autres systèmes : pas d'écran « Mes amis »
    print('— Sans BRUMEVAL_AVEC_AMIS (les autres robots) : après la création, le village comme avant')
    pg = creer(b, 'barde', avec_amis=False)
    verifier(pg.evaluate("() => M.UI.ecran") == 'accueil' and pg.locator('[data-act=nouvelle-enquete]').count() == 1, 'un robot (navigator.webdriver) va droit au village')
    pg.context.close()

    # ======================================================================== l'écran, juste après la création
    print('— Juste après « C\'est parti ! » : l\'écran « Mes amis »')
    T = {r: creer(b, r) for r in ['pisteur', 'alchimiste', 'barde', 'sage']}
    codes = {}
    for r, pg in T.items():
        d = pg.evaluate("""() => ({ecran:M.UI.ecran, amis:document.querySelectorAll('.am-ami').length, verts:document.querySelectorAll('.am-ami.on').length,
          ombres:document.querySelectorAll('.am-ami .am-ombre').length, guide:[].map.call(document.querySelectorAll('.am-ami.b-guide'), function(e){ return e.dataset.r; }),
          retour:document.querySelectorAll('[data-act=retour]').length, fin:document.querySelectorAll('.b-aller[data-act=am-fin]').length,
          moi:!!document.querySelector('.am-moi-heros svg'), roles:[].map.call(document.querySelectorAll('.am-ami'), function(e){ return e.dataset.r; })})""")
        autres = [x for x in ['pisteur', 'alchimiste', 'barde', 'sage'] if x != r]
        verifier(d['ecran'] == 'amis' and d['amis'] == 3 and d['verts'] == 0 and d['ombres'] == 3 and d['roles'] == autres and d['moi'] and d['retour'] == 0 and d['fin'] == 1 and d['guide'] == [autres[0]],
                 f'{r} : son héros, son code, trois ombres avec « ? », le rond jaune sur le premier, le bouton jaune en bas, pas de « Retour » ({d})')
        codes[r] = mon_code(pg)
        dec = pg.evaluate("(s) => { var x = M.decoderTenue6(s); return x && Object.assign({role:x.a.role}, x.a, x.vz); }", codes[r])
        h = HEROS[r]
        verifier(len(codes[r]) == 6 and dec and dec['role'] == r and all(dec[k] == h[k] for k in ['sexe', 'age', 'peau', 'cheveux', 'coiffure', 'yeux']) and (dec['barbe'] == h['barbe'] or (h['barbe'] == 'aucune' and dec['barbe'] == 'aucune')),
                 f'{r} : son code dessiné dit TOUT son héros, sa nouvelle coiffure « {h["coiffure"]} » comprise ({codes[r]} → {dec})')
        verifier(not sans_son(pg, '.am-page'), f'{r} : chaque texte a son 🔊 ({sans_son(pg, ".am-page")})')
    shot(T['pisteur'], 'telephone-amis-vide'); shot(T['alchimiste'], 'tablette-amis-vide')
    verifier(len(set(tuple(c) for c in codes.values())) == 4, 'quatre codes différents')

    # ======================================================================== les erreurs (le Pisteur, au téléphone)
    print('— Les erreurs, au doigt')
    pg = T['pisteur']
    pg.locator('.am-ami[data-r=barde]').click(); pg.wait_for_timeout(300)
    t = texte(pg)
    verifier(pg.locator('#voile .am-fenetre').count() == 1 and pg.locator('#voile .ds-six .b-case').count() == 6 and pg.locator('#voile [data-act=am-sym]').count() == 12 and 'Le code de la Barde' not in t and 'Le code du Barde' in t and not sans_son(pg, '#voile'),
             f'toucher l\'ombre du Barde : la fenêtre de son code, six cases, douze dessins ({t[:90]})')
    shot(pg, 'fenetre-code')
    taper(pg, codes['pisteur']); t = texte(pg)
    verifier('TON code' in t and pg.evaluate("() => (M.UI.modal.seq || []).length") == 0 and not ami(pg, 'barde'), f'son propre code : « Ça, c\'est TON code ! » ({t[:80]})')
    taper(pg, codes['sage']); t = texte(pg)
    verifier('celui du Sage' in t and not ami(pg, 'barde') and pg.locator('#voile .am-fenetre').count() == 1, f'le code du Sage dans la case du Barde : « c\'est celui du Sage » ({t[:80]})')
    taper(pg, ['chat'] * 6); t = texte(pg)
    verifier('ne marche pas' in t and not ami(pg, 'barde'), f'six dessins au hasard : « ce code ne marche pas » ({t[:80]})')
    pg.locator('#voile [data-act=am-sym][data-s=lune]').click(); pg.locator('#voile [data-act=am-efface]').click(); pg.wait_for_timeout(150)
    verifier(pg.evaluate("() => (M.UI.modal.seq || []).length") == 0, '⌫ Effacer enlève le dernier dessin')
    pg.locator('#voile [data-act=fermer]:has-text("Plus tard")').click(); pg.wait_for_timeout(250)
    verifier(pg.evaluate("() => M.UI.modal") is None and pg.locator('.am-ami.on').count() == 0, '« Plus tard » referme, rien n\'est gardé')

    # ======================================================================== chacun tape les trois autres
    print('— Chacun tape les codes des trois autres (lus sur leur écran)')
    for r, pg in T.items():
        for o in [x for x in ['pisteur', 'alchimiste', 'barde', 'sage'] if x != r]:
            pg.locator(f'.am-ami[data-r={o}]').click(); pg.wait_for_timeout(250)
            taper(pg, codes[o])
            a = ami(pg, o) or {}
            h = HEROS[o]
            ok = all(a.get(k) == h[k] for k in ['sexe', 'age', 'peau', 'cheveux', 'coiffure', 'yeux'])
            verifier(pg.evaluate("() => M.UI.modal") is None and pg.evaluate("() => document.getElementById('voile').hidden") and pg.locator(f'.am-ami.on[data-r={o}]').count() == 1 and ok,
                     f'{r} tape le code {o} : la fenêtre se ferme toute seule, le bouton passe au vert, {o} est gardé ({a.get("coiffure")}, {a.get("age")})')
        d = pg.evaluate("() => ({verts:document.querySelectorAll('.am-ami.on').length, ombres:document.querySelectorAll('.am-ombre').length, guide:document.querySelectorAll('[data-act=am-fin].b-guide').length, t:document.querySelector('.am-consigne').textContent})")
        verifier(d['verts'] == 3 and d['ombres'] == 0 and d['guide'] == 1 and 'Toute l\'équipe est là' in d['t'] and pg.locator('.am-plus-tard').count() == 0,
                 f'{r} : les trois boutons verts, « Toute l\'équipe est là », le rond jaune sur « En route » ({d})')
    shot(T['pisteur'], 'telephone-amis-complet'); shot(T['barde'], 'tablette-haute-amis-complet'); shot(T['sage'], 'tablette-amis-complet')

    # ======================================================================== ensuite
    print('— Ensuite : le village, l\'écran du héros, le menu, un rechargement')
    pg = T['sage']
    pg.locator('[data-act=am-fin]').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.UI.ecran") == 'accueil' and pg.locator('[data-act=nouvelle-enquete]').count() == 1, '« En route pour Brumeval ! » : le village')
    pg.evaluate("() => M.aller('heros')"); pg.wait_for_timeout(300)
    verifier(pg.locator('.hr-btn-amis').count() == 1, 'l\'écran du héros : le bouton 🤝')
    pg.locator('.hr-btn-amis').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.UI.ecran") == 'amis' and pg.locator('[data-act=retour]').count() == 1 and pg.locator('[data-act=am-fin]').count() == 0 and pg.locator('.am-ami.on').count() == 3,
             '🤝 : « Mes amis », avec « ← Retour » et sans le bouton jaune de la création')
    pg.locator('.am-ami[data-r=barde]').click(); pg.wait_for_timeout(250)
    verifier(pg.locator('#voile .am-fenetre').count() == 1 and 'Le code de la Barde' in texte(pg), 'un bouton vert se retape (« Le code de la Barde » : on sait que c\'est une fille)')
    pg.locator('#voile [data-act=fermer]:has-text("Plus tard")').click(); pg.wait_for_timeout(200)
    pg.locator('[data-act=retour]').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.UI.ecran") == 'heros', '« ← Retour » revient à l\'écran du héros')
    pg.evaluate("() => M.aller('menu')"); pg.wait_for_timeout(250)
    verifier(pg.locator('.hr-menu [data-act=ecran][data-e=amis]').count() == 1, 'le menu ☰ : « 🤝 Mes amis »')
    pg.reload(); pg.wait_for_timeout(800)
    verifier(pg.evaluate("() => !!(M.S && M.S.amis && M.S.amis.pisteur && M.S.amis.barde && M.S.amis.alchimiste)") and pg.evaluate("() => M.S.amis.barde.coiffure") == 'macarons',
             'après un rechargement de la page : les trois amis sont toujours là')

    # ======================================================================== l'enquête 3
    print('— L\'enquête 3 : la descente du Pisteur, la tenue du Sage, le cachot')
    def enquete3(pg):
        pg.evaluate("() => { M.UI.modal = null; M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
        pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
        pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
        if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
        pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    def code(pg, cle):
        seq = pg.evaluate(f"() => M.code('{cle}')")
        pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
        for s in seq: ev(pg, 'sym', {'s': s})
        pg.wait_for_timeout(400)
        return texte(pg)
    pg = T['pisteur']
    enquete3(pg)
    verifier(pg.evaluate("() => !!(M.S.amis && M.S.amis.sage && M.S.amis.alchimiste)") and pg.evaluate("() => M.P().allures") in (None, {}), 'une nouvelle enquête : les amis sont toujours là (gardés avec le héros, pas dans l\'enquête)')
    look = pg.evaluate("() => M.donjonLook()")
    verifier('p:f.p3.noir.ambre.c-courte' in look and 's:m.p2.blanc.gris.age.c-degarni.b-longue' in look and 'a:m.p5.brun.vert.c-boucles.b-courte' in look,
             f'l\'allure qui part au donjon : moi et mes deux amis, les nouvelles coiffures changées en celles d\'avant qui leur ressemblent ({look})')
    pg.evaluate("() => { M.P().vus['donjon:entree'] = 'crypte'; M.ouvrir({type:'descente'}); }"); pg.wait_for_timeout(300)
    t = texte(pg)
    verifier(pg.locator('#voile [data-act=ds-six]').count() == 0 and pg.locator('#voile .ds-amis').count() == 0 and pg.locator('#voile [data-act=ds-corriger]').count() == 0 and 'ils s\'équipent.' in t and 'chacun te montrera' not in t and 'sept potions' in t and pg.locator('#voile [data-act=ds-aller]').count() == 0,
             f'la fenêtre de la descente, sans potions : plus aucun code d\'ami à taper, il ne manque que les sept potions ({t[:160]})')
    shot(pg, 'descente-sans-potions')
    code(pg, 'info:sac_pret'); fermer(pg)
    pg.evaluate("() => M.ouvrir({type:'descente'})"); pg.wait_for_timeout(300)
    t = texte(pg)
    verifier(pg.locator('#voile [data-act=ds-aller]').count() == 1 and pg.locator('#voile [data-act=ds-six]').count() == 0 and pg.locator('#voile .ds-amis').count() == 0 and 'Tout est prêt' in t and pg.evaluate("() => M.donjonPret()"),
             f'les sept potions dans le sac : « Tout est prêt ! », « Descendre » tout de suite ({t[:100]})')
    look2 = pg.evaluate("() => (document.querySelector('#voile .ds-tenue') || {dataset:{}}).dataset.look || ''")
    verifier('s:m.p2.blanc' in look2 and 'a:m.p5.brun' in look2, f'les héros en tenue, dans la fenêtre : les vrais amis ({look2})')
    shot(pg, 'descente-prete')
    fermer(pg)

    pg = T['sage']
    enquete3(pg)
    t = code(pg, 'info:on_descend')
    verifier('Le Pisteur te connaît déjà' in t and pg.locator('#voile .ds-moncode .b-sym').count() == 6 and pg.locator('#voile .b-code-oblige').count() == 0 and not sans_son(pg, '#voile'),
             f'le Sage, « On va dans la crypte » : « Le Pisteur te connaît déjà », son code reste là sans l\'anneau jaune ({t[:160]})')
    shot(pg, 'sage-tenue')
    fermer(pg)
    # le cachot (comme tools/e3-fin.py)
    for _ in range(2):
        pg.evaluate("() => { M.UI.modal = null; M.A['passer-moment'](); }"); pg.wait_for_timeout(400); fermer(pg)
    code(pg, 'info:leo_battu'); fermer(pg)
    pg.evaluate("() => { M.UI.modal = null; M.A.accuser(); }"); pg.wait_for_timeout(250)
    pg.locator('#voile [data-act=acc-choix][data-k=ou][data-v=clocher]').click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=acc-choix][data-k=qui][data-v=melusine]').click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=acc-choix][data-k=quoi][data-v=leo]').click(); pg.wait_for_timeout(200)
    pg.locator('#voile [data-act=acc-valider]').click(); pg.wait_for_timeout(350)
    pg.locator('#voile [data-act=fin-sage]').click(); pg.wait_for_timeout(500)
    for i in range(4):
        pg.locator('[data-act=fin-suite]').click(); pg.wait_for_timeout(300)
    d = pg.evaluate("""() => { var a = document.querySelector('.b-fin-slide'); return a ? {prison:!!a.querySelector('.b-prison'), connus:a.querySelectorAll('.b-prison-ombre.connu').length,
      pave:a.querySelectorAll('.b-prison-codes [data-act=sym]').length, t:a.innerText, roles:[].map.call(a.querySelectorAll('.b-prison-ombre.connu'), function(e){ return e.dataset.role; })} : null; }""")
    verifier(d and d['prison'] and d['connus'] == 3 and d['pave'] == 0 and 'réunis' in d['t'],
             f'le cachot : les trois amis sont là tout de suite, pas de pavé, « Vous voilà réunis… » ({d and {k: d[k] for k in ["connus", "pave", "roles"]}})')
    shot(pg, 'cachot', 2600)

    for pg in T.values():
        try: pg.context.close()
        except Exception: pass
    b.close()

print()
for e in erreurs[:12]: print('  !', e)
print(f'{len(echecs)} échec(s), {len(erreurs)} erreur(s) de console')
sys.exit(1 if echecs or erreurs else 0)
