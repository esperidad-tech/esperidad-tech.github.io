"""Deux essais au plus par mini-jeu d'indice (Playwright, 390×844).
Pisteur E1 : la course-poursuite du chien ratée deux fois → « 🔁 Réessayer (dernière chance) », puis fermée ;
le deuxième essai ne coûte pas d'action. Alchimiste E1 : l'analyse du fil, idem. Barde E2 : démasquer Farinel (deux fausses accusations au plus, dans la conversation).
Vieille sauvegarde : un 'rate' déjà là compte pour un échec."""
import os, json
from playwright.sync_api import sync_playwright
URL = 'file://' + os.path.join(os.environ['BRUMEVAL_DIST'], 'index.html')
OUT = os.path.dirname(os.path.abspath(__file__)) + '/captures'
erreurs, echecs = [], []
def verif(c, msg):
    print(('  OK  ' if c else '  ✗✗ ') + msg, flush=True)
    if not c: echecs.append(msg)
def ev(pg, js): return pg.evaluate(js)
def act(pg, a, data): pg.evaluate(f"() => M.A['{a}']({{dataset:{json.dumps(data)}}})"); pg.wait_for_timeout(200)
def fermer(pg): pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(100)
def creer(b, role, N=1):
    pg = b.new_context(viewport={'width': 390, 'height': 844}, device_scale_factor=2).new_page(); pg.set_default_timeout(30000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste d'autres systèmes : l'enquête 1 sans le tutoriel guidé (tools/tuto.py teste le tutoriel)
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
    if N > 1:
        # (l'accueil d'un héros débutant n'a plus de bouton Réglages, Romain 4 novembre : on ouvre les Réglages directement pour le Mode test)
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{N}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(300)
    # tous les mini-jeux RATENT ; on compte les lancements
    pg.evaluate("() => { window.__mj = 0; MJ.lancer = function(el, type, params, fin){ window.__mj++; setTimeout(function(){ fin({reussi:false, score:0, essais:1}); }, 30); return {arreter:function(){}}; }; }")
    return pg
def entrer(pg, code):
    for s in ev(pg, f"() => M.code('{code}')"): act(pg, 'sym', {'s': s})
    pg.wait_for_timeout(400); fermer(pg)

with sync_playwright() as p:
    b = p.chromium.launch()
    # ================= Pisteur : le petit chien =================
    P = creer(b, 'pisteur')
    entrer(P, 'info:chemin')
    P.evaluate("() => { M.P().actions = 2; M.sauver(); }")
    act(P, 'explorer', {'id': 'foret'}); fermer(P)
    a0 = ev(P, "() => M.P().actions")
    act(P, 'point', {'l': 'foret', 'id': 'buisson'}); P.wait_for_timeout(300)
    k = 'pisteur:foret:buisson'
    verif(ev(P, f"() => M.nbEchecs('{k}')") == 1 and ev(P, f"() => M.P().vus['{k}']") == 'rate', '1er échec : compté (1), le point est « raté »')
    verif(P.locator('#voile .b-reessai').count() == 1 and 'Réessayer (dernière chance)' in P.inner_text('#voile .b-reessai'), '1er échec : bouton « 🔁 Réessayer (dernière chance) »')
    verif('dernière chance' in P.inner_text('#voile') and P.locator('#voile .b-lire').count() >= 1, '1er échec : le texte le dit, avec 🔊')
    P.screenshot(path=f'{OUT}/essais-1-chien-rate.png')
    n0 = ev(P, "() => window.__mj")
    P.click('#voile .b-reessai'); P.wait_for_timeout(500)
    verif(ev(P, "() => window.__mj") == n0 + 1, 'Réessayer relance la course-poursuite tout de suite')
    verif(ev(P, "() => M.P().actions") == a0, f'Le deuxième essai ne coûte pas d\'action ({a0})')
    verif(ev(P, f"() => M.nbEchecs('{k}')") == 2 and ev(P, f"() => M.ferme('{k}')"), '2e échec : le point est fermé')
    t = P.inner_text('#voile')
    verif('disparu pour de bon' in t and P.locator('#voile .b-reessai').count() == 0 and P.locator('#voile .b-lire').count() >= 1, '2e échec : « Le chien a disparu pour de bon… », avec 🔊, sans nouveau bouton')
    P.screenshot(path=f'{OUT}/essais-2-chien-ferme.png')
    fermer(P)
    n1 = ev(P, "() => window.__mj")
    act(P, 'point', {'l': 'foret', 'id': 'buisson'}); P.wait_for_timeout(300)
    verif(ev(P, "() => window.__mj") == n1 and 'disparu pour de bon' in P.inner_text('#voile'), 'Point fermé : on revoit l\'indice partiel, sans relancer le mini-jeu')
    fermer(P)
    act(P, 'lieu', {'id': 'foret'}); P.wait_for_timeout(250)
    verif('fini' in P.inner_text('#voile [data-act=point][data-id=buisson]'), 'Dans le lieu, le point affiche « 🔒 fini »')
    P.screenshot(path=f'{OUT}/essais-3-lieu.png')
    fermer(P)
    verif(any('noir et blanc' in n['t'] for n in ev(P, "() => M.P().carnet")), 'L\'indice partiel est gardé dans le Carnet')
    verif(ev(P, "() => { var L = M.etapesMission(), Mi = M.P().mission; return !!Mi.faits[7]; }"), 'Mission « attrape le petit chien » : validée aussi quand c\'est fermé (pas de blocage)')
    # vieille sauvegarde : un « raté » sans compteur = 1 échec
    verif(ev(P, "() => { var P = M.P(); P.vus['pisteur:mairie:massif'] = 'rate'; delete P.essais['pisteur:mairie:massif']; return M.nbEchecs('pisteur:mairie:massif'); }") == 1, 'Vieille sauvegarde : un « raté » déjà là compte pour 1 échec')
    verif(ev(P, "() => { M.rouvrir('pisteur:foret:buisson'); return !M.ferme('pisteur:foret:buisson') && M.nbEchecs('pisteur:foret:buisson') === 1; }"), 'M.rouvrir (pour un futur pouvoir du Sage) redonne un dernier essai')
    # ================= Alchimiste : l'analyse du fil =================
    A = creer(b, 'alchimiste')
    entrer(A, 'obj:fil')
    A.evaluate("() => { M.P().actions = 3; M.sauver(); }")
    act(A, 'analyser', {'id': 'fil'}); A.wait_for_timeout(300)
    # l'enquête 1 n'a pas de points d'action (M.sansActions) : l'analyse ne dépense rien ; dans une enquête avec actions, elle en dépense une
    sansA = ev(A, "() => M.sansActions()")
    a1 = 3 if sansA else 2
    verif(ev(A, "() => M.P().actions") == a1 and A.locator('#voile .b-reessai').count() == 1, 'Analyse ratée : ' + ('aucune action dépensée (enquête 1 sans points d\'action)' if sansA else '1 action dépensée') + ', bouton « dernière chance »')
    A.click('#voile .b-reessai'); A.wait_for_timeout(500)
    verif(ev(A, "() => M.P().actions") == a1 and ev(A, "() => M.ferme('alchimiste:analyse:fil')"), 'Deuxième essai gratuit, puis l\'analyse est fermée')
    verif('écharpe' in A.inner_text('#voile'), 'Analyse fermée : l\'indice partiel dit encore « comme une écharpe » (clé : Mélusine)')
    fermer(A)
    n2 = ev(A, "() => window.__mj")
    act(A, 'analyser', {'id': 'fil'})
    verif(ev(A, "() => window.__mj") == n2 and ev(A, "() => M.P().actions") == a1, 'Analyse fermée : on ne peut plus la relancer, et ça ne coûte rien')
    fermer(A)
    # ================= Barde (E2) : démasquer Farinel — dans la conversation (nouvelle enquête 2 : Tim n'est pas là le matin) (nouveau Barde, barde.js) =================
    # « 🤥 » sur une réponse VRAIE = une fausse accusation (un échec) ; deux échecs : Farinel ne se laisse plus démasquer de l'enquête
    B = creer(b, 'barde', 2)
    B.evaluate("() => { M.P().actions = 9; }"); act(B, 'parler', {'id': 'farinel'}); act(B, 'question', {'p': 'farinel', 'i': '0'})
    n3 = ev(B, "() => window.__mj")
    act(B, 'bd-ment', {'p': 'farinel', 'i': '0'}); B.wait_for_timeout(300)
    verif(ev(B, "() => M.nbEchecs('demasque:farinel')") == 1 and 'encore une fausse accusation' in B.inner_text('#voile'), 'Fausse accusation : un échec, et « Attention : encore une fausse accusation… »')
    act(B, 'bd-ment', {'p': 'farinel', 'i': '0'}); B.wait_for_timeout(300)
    verif(ev(B, "() => M.ferme('demasque:farinel')") and B.locator('#voile [data-act=bd-ment]').count() == 0 and 'ne te croit plus' in B.inner_text('#voile'), 'Deux fausses accusations : plus de 🤥, Farinel ne se laisse plus démasquer de l\'enquête')
    act(B, 'bd-ment', {'p': 'farinel', 'i': '0'})
    verif(ev(B, "() => M.nbEchecs('demasque:farinel')") == 2 and ev(B, "() => window.__mj") == n3, '… et plus rien ne se relance (aucun mini-jeu à part)')
    B.screenshot(path=f'{OUT}/essais-4-demasquer.png')
    print('ERREURS :', erreurs)
    print('ÉCHECS :', echecs)
    b.close()
