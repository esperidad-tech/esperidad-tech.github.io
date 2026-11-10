"""Partie complète de l'enquête 1 sur 4 écrans (Playwright), en suivant la trame parfaite du tutoriel (DESIGN 12.7),
moment par moment, par de vrais clics (la barrière du tutoriel les accepte tous : aucun « Pas maintenant »).
Usage : python3 tools/partie1.py [--vrais-mj]
Sans option, les mini-jeux sont court-circuités (réussite immédiate) pour tester le moteur."""
import sys, os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'partie1')
os.makedirs(OUT, exist_ok=True)
VRAIS_MJ = '--vrais-mj' in sys.argv
TAILLES = {'pisteur': (800, 1280), 'alchimiste': (390, 844), 'barde': (800, 1280), 'sage': (390, 844)}
erreurs = []
n = [0]

def shot(pg, nom, full=False):
    n[0] += 1
    pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png', full_page=full)

def creer(b, role):
    W, H = TAILLES[role]
    pg = b.new_context(viewport={'width': W, 'height': H}).new_page()
    pg.set_default_timeout(6000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.goto(URL)
    pg.click('[data-act=creer]')
    pg.click(f'[data-act=crea-role][data-r={role}]')
    pg.click('[data-act=crea-hasard]')
    pg.click('[data-act=crea-suite]')
    pg.fill('#nom', role.capitalize())
    pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]')
    pg.click('[data-act=commencer]')
    pg.evaluate("() => { window.__toasts = []; var t0 = M.toast; M.toast = function(t){ window.__toasts.push(String(t)); return t0.apply(this, arguments); }; }")
    if not VRAIS_MJ:
        pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 50); return {arreter:function(){}}; }; }""")
    return pg

def fermer(pg):
    pg.wait_for_timeout(150)
    if pg.is_visible('#voile .b-fermer'):
        pg.click('#voile .b-fermer')
    pg.wait_for_timeout(100)

def lieu(pg, id):
    """Touche le rond du lieu sur la carte (il n'y a plus de liste de lieux sous la carte)."""
    pg.click('[data-act=onglet][data-o=carte]')
    pg.wait_for_timeout(250)
    pg.locator(f'#carte-ici g.ca-lieu[data-lieu={id}] .ca-etiq-lieu').scroll_into_view_if_needed()
    pg.click(f'#carte-ici g.ca-lieu[data-lieu={id}] .ca-etiq-lieu')
    pg.wait_for_timeout(150)

def explorer(pg, id, points):
    lieu(pg, id)
    pg.click(f'#voile [data-act=explorer][data-id={id}]')
    for p in points:
        pg.click(f'#voile [data-act=point][data-id={p}]')
        pg.wait_for_timeout(250)
        pg.click('#voile .b-decouverte .btn.grand')
        pg.wait_for_timeout(150)
    fermer(pg)

def livre(pg, page):
    """Le Grand Livre du Sage : ouvre l'onglet, puis va à la page (« codes » des moments, « accusation », « recettes »…)."""
    if not pg.is_visible('#livre-ici'):
        pg.click('[data-act=onglet][data-o=role]')
    pg.evaluate(f"() => M.livreAller('{page}', true)")
    pg.wait_for_timeout(120)

def code_de(pg, id):
    return pg.evaluate(f"() => M.code('{id}')")

def bouton_ou_action(pg, act, id):
    """Touche le bouton s'il est à l'écran ; sinon (atelier plein écran, où tout se fait sur l'image) lance la même action."""
    sel = f'[data-act={act}][data-id={id}]'
    # atelier plein écran : on touche d'abord la chose de la pièce (loupe = analyses, armoire = potions), qui ouvre le panneau
    meuble = {'analyser': 'analyses', 'donner-potion': 'potions', 'vendre': 'potions'}.get(act)
    if meuble and not pg.is_visible(sel) and pg.locator(f'#atelier-ici [data-at={meuble}]').count():
        pg.evaluate(f"() => document.querySelector('#atelier-ici [data-at={meuble}]').dispatchEvent(new MouseEvent('click', {{bubbles:true}}))")
        pg.wait_for_timeout(350)
    if pg.is_visible(sel): pg.click(sel)
    else: pg.evaluate(f"() => M.A['{act}']({{dataset:{{id:'{id}'}}}})")

def entrer(pg, seq):
    pg.click('[data-act=onglet][data-o=code]')
    for s in seq:
        pg.click(f'[data-act=sym][data-s={s}]')
    pg.wait_for_timeout(500)
    try: pg.wait_for_function("() => !!M.UI.modal && !!document.querySelector('#voile .b-fermer')", timeout=5000)   # machine chargée : la fenêtre du code peut venir tard (fermer() doit la trouver)
    except Exception: pass

def parler(pg, pnj, questions, lieu_id=None, maison=None):
    if maison:
        pg.click('[data-act=onglet][data-o=carte]')
        pg.evaluate(f"() => M.A.maison({{dataset:{{id:'{maison}'}}}})")   # (le Barde frappe tout de suite : plus de feuille « Qui habite ici ? »)
    else:
        lieu(pg, lieu_id)
        pg.click(f'#voile [data-act=parler][data-id={pnj}]')
    for i in questions:
        pg.click(f'#voile [data-act=question][data-p={pnj}][data-i="{i}"]')
        pg.wait_for_timeout(200)
        if pg.is_visible('#voile .b-decouverte'):
            pg.click('#voile .b-decouverte .btn.grand')
            pg.wait_for_timeout(150)
    fermer(pg)

def maison(pg, m):
    """Touche une maison sur la carte (elle seule se touche quand c'est l'étape)"""
    pg.click('[data-act=onglet][data-o=carte]'); pg.wait_for_timeout(250)
    sel = f'#carte-ici [data-act=maison][data-id={m}]'
    pg.locator(sel).first.scroll_into_view_if_needed(); pg.locator(sel).first.click(force=True); pg.wait_for_timeout(200)

def questions(pg, pnj, l):
    for i in l:
        sel = f'#voile [data-act=question][data-p={pnj}][data-i="{i}"]'
        if pg.is_visible(sel): pg.click(sel); pg.wait_for_timeout(250)
        if pg.is_visible('#voile .b-decouverte'): pg.click('#voile .b-decouverte .btn.grand'); pg.wait_for_timeout(200)
    fermer(pg)

def bandeau(pg): return pg.evaluate("() => { var g = M.tutoGuide(); return g ? g.etat + ' · ' + g.but : ''; }")
def fait(pg):
    pg.wait_for_timeout(400)
    pg.click('.tu-bandeau [data-act=tuto-fait]'); pg.wait_for_timeout(300)
def bonus(pg, l, id):
    lieu(pg, l); pg.click(f'#voile [data-act=bonus][data-id={id}]'); pg.wait_for_timeout(400); fermer(pg)
def moment(S, J, n):
    livre(S, 'codes'); S.click('.lv-page.on [data-act=moment-suivant]'); shot(S, f'sage-code-moment{n}')
    seq = code_de(S, f'moment:{n}')
    S.click('#voile [data-act=passer-moment]'); S.wait_for_timeout(2400)
    for pg in J: entrer(pg, seq); fermer(pg)

with sync_playwright() as p:
    b = p.chromium.launch()
    J = {r: creer(b, r) for r in ['pisteur', 'alchimiste', 'barde', 'sage']}
    P, A, B, S = J['pisteur'], J['alchimiste'], J['barde'], J['sage']
    for r, pg in J.items(): print('Début', r, ':', bandeau(pg))
    shot(S, 'sage-livre')
    # ======== Matin ========
    # Sage : lit « Les habitants » à l'équipe (plus de code du registre pour le Barde) ; lit la recette de l'encre à l'Alchimiste
    livre(S, 'habitants'); fait(S); shot(S, 'sage-habitants-fait')
    livre(S, 'recettes'); shot(S, 'sage-recettes')
    # Pisteur : la mairie (traces, fenêtre → fil pour l'Alchimiste, gouttière), la place (fontaine, panneau → affiche pour le Barde)
    explorer(P, 'mairie', ['massif', 'fenetre', 'gouttiere']); shot(P, 'pisteur-apres-mairie')
    explorer(P, 'place', ['fontaine', 'affiche'])
    print('  Pisteur fin du matin :', bandeau(P))
    # Barde : la maison d'Odette (son visage est dessus : la toucher frappe tout de suite), Odette (→ plume pour l'Alchimiste), Basile (→ chemin de la forêt pour le Pisteur)
    maison(B, 'L2'); B.wait_for_timeout(300); shot(B, 'barde-chez-odette'); questions(B, 'odette', [0, 1, 2, 3])
    lieu(B, 'potager'); B.click('#voile [data-act=parler][data-id=basile]'); B.wait_for_timeout(300); questions(B, 'basile', [2])
    shot(B, 'barde-apres-basile')
    # Alchimiste : l'atelier (un carton), la lisière (3 baies), l'encre (→ Sage), le fil (code du Pisteur → écharpe pour le Barde)
    A.click('[data-act=onglet][data-o=role]'); A.wait_for_timeout(700)
    for _ in range(3):
        if A.evaluate('() => M.condMission({rangement:1})'): break
        if A.locator('.at-carton').count(): A.locator('.at-carton').first.click(force=True)
        A.wait_for_timeout(900)
    A.wait_for_timeout(1700)
    print('  Alchimiste après l\'atelier :', bandeau(A))
    lieu(A, 'lisiere'); A.click('#voile [data-act=cueillir][data-id=lisiere]'); shot(A, 'alchi-cueillette'); fermer(A)
    A.click('[data-act=onglet][data-o=role]'); A.wait_for_timeout(400); shot(A, 'alchi-atelier')
    A.evaluate("() => { M.S.potions.revelatrice = (M.S.potions.revelatrice || 0) + 1; M.P().actions = Math.max(0, M.P().actions - 1); M.UI.tutoGrimoire = 1; M.sauver(); M.render(); }")   # le grand chaudron est testé à part
    bouton_ou_action(A, 'donner-potion', 'revelatrice'); shot(A, 'alchi-donne'); A.click('#voile [data-act=potion-donnee]')
    entrer(S, code_de(S, 'pot:revelatrice')); fermer(S)
    entrer(A, code_de(A, 'obj:fil')); fermer(A)
    A.click('[data-act=onglet][data-o=role]'); A.wait_for_timeout(300)
    bouton_ou_action(A, 'analyser', 'fil'); A.wait_for_timeout(300); shot(A, 'alchi-analyse-fil'); fermer(A)
    entrer(B, code_de(B, 'info:echarpe')); fermer(B)
    entrer(A, code_de(A, 'obj:plume')); fermer(A)
    # Sage : la mairie (le balcon), puis la mission bonus de l'horloge, pendant que l'encre attend l'après-midi
    explorer(S, 'mairie', ['balcon'])
    print('  Sage après le balcon :', bandeau(S))
    bonus(S, 'mairie', 'horloge')
    for r, pg in J.items(): print('  fin du matin', r, ':', bandeau(pg))
    moment(S, (P, A, B), 1)
    # ======== Après-midi ========
    entrer(P, code_de(P, 'info:carte')); fermer(P)   # (10 novembre : seul le plan du Sage ouvre la forêt)
    explorer(P, 'boulangerie', ['sol', 'four'])
    entrer(B, code_de(B, 'info:grands_pieds')); fermer(B)
    explorer(P, 'foret', ['carrefour', 'ch_moulin', 'ch_puits', 'ch_chene', 'buisson'])
    entrer(B, code_de(B, 'obj:affiche')); fermer(B)
    lieu(B, 'place'); B.click('#voile [data-act=parler][data-id=melusine]'); B.wait_for_timeout(300); questions(B, 'melusine', [0, 1, 2])
    lieu(B, 'boulangerie'); B.click('#voile [data-act=parler][data-id=gaspard]'); B.wait_for_timeout(300); questions(B, 'gaspard', [0, 1])
    shot(B, 'barde-apresmidi')
    print('  Alchimiste en attendant les poils :', bandeau(A))
    bonus(A, 'boulangerie', 'fournees')
    entrer(A, code_de(A, 'obj:poils')); fermer(A)
    A.click('[data-act=onglet][data-o=role]'); A.wait_for_timeout(300)
    bouton_ou_action(A, 'analyser', 'poils'); A.wait_for_timeout(300); fermer(A)
    # Sage : la page blanche, les runes → le plan de la forêt (pour le Pisteur : il l'a déjà, par Basile)
    livre(S, 'mystere')
    S.click('[data-lv=blanche][data-id=mystere]'); S.wait_for_timeout(500); shot(S, 'sage-carte-foret'); fermer(S)
    for r, pg in J.items(): print('  fin de l\'après-midi', r, ':', bandeau(pg))
    moment(S, (P, A, B), 2)
    # ======== Soir ========
    explorer(P, 'chene', ['racines']); fait(P)
    bonus(P, 'clocher', 'ballon'); shot(P, 'pisteur-carte-toute')
    A.click('[data-act=onglet][data-o=role]'); A.wait_for_timeout(300)
    bouton_ou_action(A, 'analyser', 'plume'); A.wait_for_timeout(300); fermer(A); fait(A)
    A.click('[data-act=onglet][data-o=carnet]'); shot(A, 'alchi-carnet', True)
    lieu(B, 'taverne'); B.click('#voile [data-act=parler][data-id=victor]'); B.wait_for_timeout(300); questions(B, 'victor', [0, 1]); fait(B)
    livre(S, 'tableau'); fait(S)
    for r, pg in J.items(): print('  avant l\'accusation', r, ':', bandeau(pg))
    # ---- Accusation ----
    livre(S, 'accusation'); S.click('.lv-page.on [data-act=accuser]')
    S.click('#voile [data-act=acc-choix][data-k=qui][data-v=odette]')
    S.click('#voile [data-act=acc-choix][data-k=ou][data-v=toits]')
    S.click('#voile [data-act=acc-valider]'); shot(S, 'sage-erreur'); fermer(S)
    livre(S, 'accusation'); S.click('.lv-page.on [data-act=accuser]')
    S.click('#voile [data-act=acc-choix][data-k=qui][data-v=tim]'); shot(S, 'sage-accuse-ou')
    S.click('#voile [data-act=acc-choix][data-k=ou][data-v=chene]')
    S.click('#voile [data-act=acc-valider]'); S.wait_for_timeout(300); shot(S, 'sage-victoire')
    vic = code_de(S, 'victoire:1')
    S.click('#voile [data-act=fin-sage]')
    for pg in (P, A, B):
        entrer(pg, vic)
    shot(B, 'barde-fin-1')
    for i in range(8):
        B.click('[data-act=fin-suite]'); B.wait_for_timeout(100)
    shot(B, 'barde-recompenses', True)
    B.click('[data-act=choisir-talent]'); B.wait_for_timeout(300); shot(B, 'barde-talent')
    B.click('#voile [data-act=talent]'); fermer(B)
    B.click('[data-act=fin-retour]'); shot(B, 'barde-hub')
    B.click('[data-act=ecran][data-e=boutique]'); shot(B, 'barde-boutique', True)
    for pg, r in ((P, 'p'), (A, 'a'), (S, 's')):
        for i in range(8):
            if pg.is_visible('[data-act=fin-suite]'): pg.click('[data-act=fin-suite]')
        pg.click('[data-act=fin-retour]')
    refus = {r: [t for t in pg.evaluate('() => window.__toasts') if 'Pas maintenant' in t or 'Pas encore' in t] for r, pg in J.items()}
    print('Refus du tutoriel (doit être vide) :', {r: v for r, v in refus.items() if v})
    print('Missions :', {r: pg.evaluate("() => { var J = M.S.journal[1] || {}, Mi = J.mission || {faits:{}}; return Object.keys(Mi.faits || {}).length; }") for r, pg in J.items()})
    print('XP/or :', [pg.evaluate('() => [M.S.xp, M.S.or, M.S.prochaine]') for pg in (P, A, B, S)])
    if any(refus.values()): erreurs.append('REFUS ' + str(refus))
    print('ERREURS :', erreurs)
    b.close()
