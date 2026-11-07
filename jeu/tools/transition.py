"""Test de régression (Playwright, 4 tablettes) : le passage de l'enquête 1 à l'enquête 2 par tous les chemins
qu'une vraie famille peut prendre, et les codes de lieu (plans, chemins, passages) valables pour les quatre rôles.
Usage : BRUMEVAL_DIST=/chemin python3 tools/transition.py

Bug du 2 novembre : le code « enquête suivante » de l'enquête 1 (gagnée sans erreur) avait les mêmes symboles que
la potion d'invisibilité de l'enquête 2. Une tablette déjà dans l'enquête 2 (après « Retour au village » puis
« Enquête 2 », ou après un rechargement) lisait donc ce code comme la potion : l'Alchimiste voyait « Ce code n'est
pas pour toi », le Pisteur et le Barde recevaient une potion. Et au village, il n'y avait nulle part où taper le code.

Chemins testés (chaque tablette doit arriver dans l'enquête 2 avec ses récompenses une seule fois, ou voir un message clair) :
  A (0 erreur) : codes du plan de la forêt pour les 4 rôles ; refus aimable d'un code d'un autre rôle ;
     Sage parti le premier ; Pisteur au milieu de l'histoire ; Alchimiste dans l'atelier (chaudron), talent en attente,
     « Retour au village » puis code tapé au village, puis code retapé dans l'enquête 2 ; Barde qui tape directement
     le code de suite depuis l'onglet Code, puis le code de victoire en retard.
  B (1 erreur) : rechargements (Sage aux récompenses, Pisteur aux récompenses, Barde au milieu de l'histoire,
     Alchimiste en plein mini-jeu) ; bouton « Enquête 2 » ; code de victoire tapé au village.
  C (2 erreurs) : une tablette qui a abandonné ; « Retour au village » puis bouton « Enquête 2 » ;
     code de victoire tapé au village alors que l'enquête est rangée ; un code de l'enquête 2 tapé trop tôt."""
import os
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'transition')
os.makedirs(OUT, exist_ok=True)
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']
erreurs, echecs = [], []
n = [0]

def shot(pg, nom, full=False):
    n[0] += 1
    pg.wait_for_timeout(450)   # la page apparaît en fondu (0,35 s)
    try: pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png', full_page=full)
    except Exception as e: print('  (capture ratée)', nom, e)

def verif(cond, msg):
    print(('  ok   ' if cond else '  ÉCHEC ') + msg)
    if not cond: echecs.append(msg)

def ev(pg, js):
    return pg.evaluate(js)

def ecouter(pg, role):
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))

def creer(b, role, enfant=False):
    pg = b.new_context(viewport={'width': 800 if role in ('pisteur', 'barde') else 390, 'height': 1000}).new_page()
    pg.set_default_timeout(15000)
    ecouter(pg, role)
    pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste d'autres systèmes : l'enquête 1 sans le tutoriel guidé (tools/tuto.py teste le tutoriel)
    pg.goto(URL, wait_until='domcontentloaded', timeout=30000)
    pg.wait_for_selector('[data-act=creer]', timeout=20000)
    pg.click('[data-act=creer]')
    pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]')
    pg.fill('#nom', role.capitalize())
    pg.click('[data-act=crea-fin]')   # (plus de choix enfant / adulte : « enfant » ne sert plus)
    pg.click('[data-act=nouvelle-enquete]')
    pg.click('[data-act=commencer]')
    return pg

def taper(pg, seq, onglet=True):
    if onglet and pg.is_visible('[data-act=onglet][data-o=code]'):
        pg.click('[data-act=onglet][data-o=code]')
    for s in seq:
        pg.click(f'#app [data-act=sym][data-s={s}]')
    pg.wait_for_timeout(450)

def modal(pg):
    return ev(pg, "() => M.UI.modal ? {type:M.UI.modal.type, titre:M.UI.modal.titre || '', t:M.UI.modal.t || '', lire:!!document.querySelector('#voile .b-lire')} : null")

def fermer(pg):
    pg.wait_for_timeout(100)
    ev(pg, '() => { if(M.UI.modal) M.fermer(); }')
    pg.wait_for_timeout(80)

def etat(pg):
    return ev(pg, "() => ({e:M.P() ? M.P().id : null, etape:M.P() ? M.P().etape : null, ecran:M.UI.ecran, xp:M.S.xp, or:M.S.or, niv:M.niveau(M.S.xp).n, prochaine:M.S.prochaine})")

def recharger(pg):
    pg.reload(wait_until='domcontentloaded', timeout=30000)
    pg.wait_for_selector('#app main, #app .b-jeu', timeout=20000)
    pg.wait_for_timeout(300)

def histoire(pg, fois=12):
    """Touche « Suite → » jusqu'aux récompenses (ou `fois` fois)."""
    for i in range(fois):
        if not pg.is_visible('[data-act=fin-suite]'): break
        pg.click('[data-act=fin-suite]'); pg.wait_for_timeout(60)

def livre(pg, page):
    """Le Grand Livre du Sage : ouvre l'onglet, puis va à la page (« accusation », « codes » des moments…)."""
    if not pg.is_visible('#livre-ici'):
        pg.click('[data-act=onglet][data-o=role]')
    pg.evaluate(f"() => M.livreAller('{page}', true)")
    pg.wait_for_timeout(120)

def accuser(S, bonne):
    sol = ev(S, "() => { var E = M.E(); return {qui:E.qui.choix, sol:E.solution, dims:['qui','ou','quoi'].filter(function(d){ return E[d]; }), ch:{ou:E.ou && E.ou.choix.map(function(c){return c.id;}), quoi:E.quoi && E.quoi.choix.map(function(c){return c.id;})}}; }")
    livre(S, 'accusation')   # l'accusation est la dernière page du Grand Livre (plus de bouton ⚖️ dans le bandeau)
    S.click('[data-act=accuser]')
    for d in sol['dims']:
        if d == 'qui':
            v = sol['sol']['qui'] if bonne else [x for x in sol['qui'] if x != sol['sol']['qui']][0]
        else:
            v = sol['sol'][d] if bonne else [x for x in sol['ch'][d] if x != sol['sol'][d]][0]
        S.click(f'#voile [data-act=acc-choix][data-k={d}][data-v="{v}"]')
    S.click('#voile [data-act=acc-valider]')
    S.wait_for_timeout(250)

def gagner(S, nerr):
    """Le Sage se trompe `nerr` fois, puis gagne. Renvoie (code de victoire, code de l'enquête suivante)."""
    for i in range(nerr):
        accuser(S, False); fermer(S)
    accuser(S, True)
    k = min(nerr, 2)
    vic = ev(S, f"() => M.code('victoire:{k}')")
    S.click('#voile [data-act=fin-sage]'); S.wait_for_timeout(150)
    suite = ev(S, f"() => M.code('suite:{min(k, 3)}')")
    return vic, suite

def arrive_e2(pg, r, chemin):
    st = etat(pg)
    verif(st['e'] == 2 and st['etape'] in ('lettre', 'jeu') and st['ecran'] == 'enquete', f'{r} ({chemin}) : arrive dans l\'enquête 2 ({st})')
    verif(st['xp'] == 130 and st['niv'] == 2 and st['prochaine'] == 2, f'{r} ({chemin}) : récompenses données une seule fois (xp {st["xp"]}, niveau {st["niv"]})')
    return st

def deja_dans_e2(pg, r, seq, quoi):
    """Taper un vieux code de l'enquête 1 alors qu'on est déjà dans l'enquête 2 : message clair, rien ne change."""
    avant = ev(pg, '() => JSON.stringify([M.S.xp, M.S.or, M.P().potions, M.P().recus, M.P().actions])')
    taper(pg, seq); m = modal(pg)
    verif(m is not None and 'déjà dans l\'enquête 2' in m['titre'], f'{r} : {quoi} retapé dans l\'enquête 2 → « {m and m["titre"]} »')
    verif(ev(pg, '() => JSON.stringify([M.S.xp, M.S.or, M.P().potions, M.P().recus, M.P().actions])') == avant, f'{r} : ce vieux code ne donne rien (ni potion, ni or, ni action)')
    fermer(pg)

def ouvrir_chaudron(A):
    """L'Alchimiste range de quoi faire sa première recette dans une caisse, puis ouvre le grand chaudron de l'atelier."""
    ev(A, """() => { var r = M.recettesConnues()[0], R = DONNEES.RECETTES[r], i = {};
      R.ingr.forEach(function(x){ i[x[0]] = (i[x[0]] || 0) + x[1]; });
      if(!M.S.atelier) M.S.atelier = Atelier.etatNeuf();
      M.S.atelier.objets.push({id:'tz' + Date.now(), t:'caisse', x:330, y:620, f:0, v:0, sur:null, on:0, neuf:0, cases:[{e:[], i:i}]});
      M.P().onglet = 'role'; M.UI.sousAtelier = 'atelier'; M.sauver(); M.render(); }""")
    A.wait_for_timeout(700)
    # Atelier v3 : on touche le grand chaudron de la pièce, puis la première potion faisable
    ev(A, "() => { var c = document.querySelector('#atelier-ici [data-at=chaudron]'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }")
    A.wait_for_timeout(600)
    ev(A, "() => { var g = document.querySelector('#atelier-ici .at-ch-go'); if(g) g.click(); }")
    A.wait_for_timeout(900)
    if A.is_visible('#atelier-ici .at-mj'): return True
    if A.is_visible('#atelier-ici .at-btn-grim'):
        A.click('#atelier-ici .at-btn-grim'); A.wait_for_timeout(500)
    if A.is_visible('#atelier-ici .at-preparer'):
        A.click('#atelier-ici .at-preparer'); A.wait_for_timeout(700)
    return A.is_visible('#atelier-ici .at-mj')

with sync_playwright() as p:
    b = p.chromium.launch()

    # =====================================================================
    print('\n=== Partie A : enquête 1 gagnée sans erreur ===')
    J = {r: creer(b, r, enfant=(r == 'alchimiste')) for r in ROLES}
    S, P, A, B = J['sage'], J['pisteur'], J['alchimiste'], J['barde']

    # --- Les codes de passage ne veulent jamais dire autre chose dans l'enquête d'à côté ---
    col = ev(S, """() => { var l = [];
      Object.keys(ENQUETES).map(Number).forEach(function(a){
        var ca = M.codesEnquete(ENQUETES[a]);
        if(Object.keys(ca.parCode).length !== Object.keys(ca.parId).length) l.push('E' + a + ' : deux fois le même code');
        [a - 1, a + 1].forEach(function(v){ var V = ENQUETES[v]; if(!V) return; var cv = M.codesEnquete(V);
          Object.keys(ca.parId).forEach(function(id){ if(!M.codePassage(id)) return; var x = cv.parCode[ca.parId[id].join('-')]; if(x) l.push('E' + a + ' ' + id + ' = E' + v + ' ' + x); }); });
      }); return l; }""")
    verif(not col, f'Aucun code de fin ou de suite ne veut dire autre chose dans l\'enquête voisine {col}')
    verif(ev(S, "() => M.codeDe(ENQUETES[1], 'suite:0').join('-') !== M.codeDe(ENQUETES[2], 'pot:invisibilite').join('-')"), 'E1 « suite » ≠ E2 « potion d\'invisibilité » (le bug du 2 novembre)')

    # --- Problème 1 : le plan de la forêt est pour toute l'équipe ---
    carte = ev(S, "() => M.code('info:carte')"); chemin = ev(S, "() => M.code('info:chemin')")
    verif(ev(A, "() => !!M.verrouLieu('foret') && !!M.verrouLieu('clairiere')"), 'Avant le plan : la forêt et la clairière sont fermées pour l\'Alchimiste')
    verif('toute l\'équipe : chacun peut le taper' in ev(S, "() => M.texteDonne('info:carte')"), 'Le Grand Livre dit : « ce code est pour toute l\'équipe : chacun peut le taper ! »')
    textes = {}
    for r in ROLES:
        verif(ev(J[r], "() => M.destinataire('info:carte') === 'tous' && M.destinataire('info:chemin') === 'tous'"), f'{r} : plan et chemin de la forêt = codes de toute l\'équipe')
        taper(J[r], carte); m = modal(J[r]); textes[r] = m and m['t']
        verif(m is not None and m['titre'].startswith('Tu as reçu'), f'{r} accepte le code du plan de la forêt (« {m and m["titre"]} »)')
        verif(ev(J[r], "() => !M.verrouLieu('foret') && !M.verrouLieu('chene')"), f'{r} : la forêt est ouverte sur sa tablette')
        if r == 'alchimiste': shot(A, 'alchi-recoit-plan-foret')
        fermer(J[r])
    verif('ouvert sur ta carte' in (textes['alchimiste'] or '') and 'clairière' in (textes['alchimiste'] or '').lower(), f'Alchimiste : « C\'est ouvert sur ta carte : … la clairière » ({textes["alchimiste"]})')
    verif('rien à faire là-bas' in (textes['sage'] or ''), f'Sage : on lui dit qui va dans la forêt ({textes["sage"]})')
    A.click('[data-act=onglet][data-o=carte]'); ev(A, "() => M.A.lieu({dataset:{id:'clairiere'}})"); A.wait_for_timeout(200)
    verif(A.is_visible('#voile [data-act=cueillir]'), 'L\'Alchimiste peut chercher des ingrédients dans la clairière')
    shot(A, 'alchi-clairiere'); fermer(A)
    taper(B, chemin); m = modal(B)
    verif(m is not None and m['titre'].startswith('Tu as reçu'), f'Le Barde accepte le chemin de Basile (« {m and m["titre"]} »)'); fermer(B)
    taper(B, chemin); m = modal(B)
    verif(m is not None and 'Déjà reçu' in m['titre'], 'Retaper le même plan : « Déjà reçu »'); fermer(B)
    # --- Un code d'un seul rôle : refus aimable, avec 🔊 ---
    taper(B, ev(S, "() => M.code('obj:fil')")); m = modal(B); shot(B, 'barde-code-pour-alchimiste')
    verif(m is not None and m['t'] == 'Ce code est pour l\'Alchimiste : dis-lui de le taper sur sa tablette !' and m['lire'], f'Code de l\'Alchimiste tapé par le Barde : message clair avec 🔊 ({m})')
    verif(not ev(B, "() => !!M.P().recus['obj:fil']"), 'Le Barde ne reçoit pas l\'objet de l\'Alchimiste'); fermer(B)
    taper(A, ev(S, "() => M.code('pot:invisibilite')")); m = modal(A)
    verif(m is not None and m['t'] == 'Ce code est pour le Barde ou le Pisteur : dis-leur de le taper sur leur tablette !', f'Potion pour deux rôles : « {m and m["t"]} »'); fermer(A)
    taper(S, ev(S, "() => M.code('moment:1')")); m = modal(S)
    verif(m is not None and 'les autres joueurs : dis-leur' in m['t'], f'Le Sage tape un code de moment : « {m and m["t"]} »'); fermer(S)

    # --- L'Alchimiste est devant le grand chaudron de l'atelier quand le Sage gagne ---
    chaudron = ouvrir_chaudron(A)
    verif(chaudron, 'L\'Alchimiste a ouvert le grand chaudron de son atelier')
    shot(A, 'alchi-chaudron')
    vic, suite = gagner(S, 0)
    histoire(S); shot(S, 'sage-recompenses', True)
    verif(S.is_visible('[data-act=suite-sage]'), 'Le Sage voit le code et le bouton de l\'enquête 2')
    # Le Sage part tout de suite : les autres sont tous « en retard »
    S.click('[data-act=suite-sage]'); S.wait_for_timeout(250)
    verif(ev(S, '() => M.P().id') == 2, 'Le Sage part le premier pour l\'enquête 2')
    venue = ev(S, '() => M.codeVenue(2)')
    verif(venue == suite, f'Le Sage garde le code de l\'enquête 2 pour ceux qui sont en retard ({venue} / {suite})')
    verif(S.is_visible('.b-lettre-page .b-suite .b-code'), 'Sur la lettre de l\'enquête 2, le Sage voit encore ce code')
    S.click('[data-act=commencer]'); S.click('[data-act=onglet][data-o=carnet]')
    verif(ev(S, "() => document.querySelector('.b-carnet').innerText.indexOf('encore à l\\'enquête 1') >= 0"), 'Dans son carnet aussi')
    shot(S, 'sage-carnet-e2', True)

    # Pisteur : code de victoire en retard, puis le code de suite au milieu de l'histoire
    taper(P, vic); histoire(P, 2)
    verif(ev(P, '() => M.P().etape === "fin" && M.P().fin.etape === "histoire"'), 'Pisteur : au milieu de l\'histoire de fin')
    P.click('[data-act=pad-suite]'); shot(P, 'pisteur-histoire-pave')
    taper(P, suite, onglet=False)
    arrive_e2(P, 'pisteur', 'code tapé pendant l\'histoire')

    # Alchimiste : du chaudron à l'onglet Code, victoire, récompenses, talent, Retour au village, code au village
    taper(A, vic)
    verif(ev(A, '() => M.P().etape') == 'fin', 'Alchimiste : le code de victoire marche depuis le chaudron (via l\'onglet Code)')
    histoire(A)
    verif(A.is_visible('[data-act=choisir-talent]'), 'Alchimiste : un talent du niveau 2 à choisir')
    A.click('[data-act=fin-retour]'); A.wait_for_timeout(200)
    shot(A, 'alchi-village', True)
    verif(A.is_visible('#app .b-suite [data-act=sym]') and A.is_visible('[data-act=nouvelle-enquete]'), 'Village : on peut taper le code du Sage, ou toucher « Enquête 2 »')
    taper(A, suite, onglet=False)
    arrive_e2(A, 'alchimiste', 'Retour au village puis code au village')
    verif(A.is_visible('.b-lettre-page [data-act=choisir-talent]'), 'Alchimiste : la lettre de l\'enquête 2 rappelle le talent à choisir')
    A.click('.b-lettre-page [data-act=choisir-talent]'); A.click('#voile [data-act=talent]'); fermer(A)
    verif(ev(A, '() => M.talentsEnAttente().length') == 0, 'Alchimiste : talent choisi')
    A.click('[data-act=commencer]')
    deja_dans_e2(A, 'alchimiste', suite, 'le code de l\'enquête suivante')
    deja_dans_e2(A, 'alchimiste', vic, 'le code de victoire')
    verif(not ev(A, '() => !!(M.P().potions && M.P().potions.invisibilite)'), 'Pas de potion d\'invisibilité gagnée par erreur')

    # Barde : ne tape pas la victoire, tape directement le code de suite dans l'onglet Code, puis la victoire en retard
    taper(B, suite)
    arrive_e2(B, 'barde', 'code de suite depuis l\'onglet Code, sans la victoire')
    verif(ev(B, '() => !!(M.S.journal && M.S.journal[1]) && !!M.S.finies[1]'), 'Barde : l\'enquête 1 est rangée dans le journal')
    B.click('[data-act=commencer]')
    deja_dans_e2(B, 'barde', vic, 'le code de victoire (tapé en retard)')
    deja_dans_e2(B, 'barde', suite, 'le code de l\'enquête suivante')
    P.click('[data-act=commencer]')
    deja_dans_e2(P, 'pisteur', suite, 'le code de l\'enquête suivante')
    for r in ROLES:
        J[r].context.close()

    # =====================================================================
    print('\n=== Partie B : une erreur, et des rechargements ===')
    J = {r: creer(b, r, enfant=(r == 'barde')) for r in ROLES}
    S, P, A, B = J['sage'], J['pisteur'], J['alchimiste'], J['barde']
    # L'Alchimiste est en plein mini-jeu quand le Sage gagne
    ev(A, "() => { M.lancerMJ('bulles', 1, null, {titre:'Test', sansPotion:true}, function(){}); }"); A.wait_for_timeout(500)
    verif(A.is_visible('#mj-plein'), 'Alchimiste : un mini-jeu est ouvert')
    vic, suite = gagner(S, 1)
    histoire(S)
    # Sage : rechargement sur l'écran des récompenses
    recharger(S)
    shot(S, 'sage-village-apres-rechargement', True)
    verif(ev(S, f"() => document.querySelector('#app .b-suite .b-code') !== null && M.codeVenue(2).join('-') === '{'-'.join(suite)}'"), 'Sage rechargé : le village montre le code de l\'enquête 2')
    S.click('[data-act=nouvelle-enquete]'); S.wait_for_timeout(200)
    st = etat(S)
    verif(st['e'] == 2 and st['xp'] == 130, f'Sage : bouton « Enquête 2 » au village ({st})')
    # Pisteur : récompenses, rechargement, puis le code de victoire tapé au village, puis le code de suite
    taper(P, vic); histoire(P)
    recharger(P)
    verif(P.is_visible('#app .b-suite [data-act=sym]'), 'Pisteur rechargé : le pavé du code est au village')
    taper(P, vic, onglet=False)
    st = etat(P)
    verif(st['ecran'] == 'enquete' and st['etape'] == 'fin' and st['xp'] == 130, f'Pisteur : le code de victoire tapé au village montre la fin, sans double récompense ({st})')
    taper(P, suite, onglet=False)
    arrive_e2(P, 'pisteur', 'rechargé aux récompenses')
    # Barde : rechargement au milieu de l'histoire, puis code tapé au village
    taper(B, vic); histoire(B, 3)
    recharger(B)
    shot(B, 'barde-village-histoire', True)
    taper(B, suite, onglet=False)
    arrive_e2(B, 'barde', 'rechargé pendant l\'histoire, code au village')
    # Alchimiste : rechargement en plein mini-jeu, « Reprendre », onglet Code, code de suite
    recharger(A)
    verif(A.is_visible('[data-act=reprendre]'), 'Alchimiste rechargé en plein mini-jeu : « Reprendre l\'enquête 1 »')
    A.click('[data-act=reprendre]'); A.wait_for_timeout(200)
    taper(A, suite)
    arrive_e2(A, 'alchimiste', 'rechargé en plein mini-jeu, puis onglet Code')
    recharger(A)
    st = etat(A)
    verif(st['e'] == 2 and st['xp'] == 130 and st['ecran'] == 'accueil', f'Alchimiste rechargé dans l\'enquête 2 : tout est gardé ({st})')
    verif(A.is_visible('[data-act=reprendre]'), 'Alchimiste : « Reprendre l\'enquête 2 »')
    A.click('[data-act=reprendre]'); A.click('[data-act=commencer]')
    deja_dans_e2(A, 'alchimiste', suite, 'le code de l\'enquête suivante')
    for r in ROLES:
        J[r].context.close()

    # =====================================================================
    print('\n=== Partie C : deux erreurs, abandon, bouton « Enquête 2 » ===')
    J = {r: creer(b, r) for r in ROLES}
    S, P, A, B = J['sage'], J['pisteur'], J['alchimiste'], J['barde']
    # La tablette du Barde est déjà dans la défaite (code de défaite tapé par erreur ; « Abandonner » n'existe plus) :
    # le code de suite ne doit pas échouer en silence
    ev(B, '() => M.defaite()'); B.wait_for_timeout(150)
    vic, suite = gagner(S, 2)
    histoire(S)
    e2moment = ev(S, "() => M.codeDe(ENQUETES[2], 'moment:1')")
    S.click('[data-act=suite-sage]'); S.wait_for_timeout(200)
    # l'écran de défaite n'a pas de pavé : on tape le code par la même fonction qu'un clic sur un symbole
    js = '() => { M.UI.saisie = []; ' + ''.join("M.A.sym({dataset:{s:'%s'}}); " % s for s in suite) + '}'
    ev(B, js); B.wait_for_timeout(500)
    m = modal(B)
    verif(m is not None and 'perdue' in m['titre'], f'Barde qui a abandonné : message clair, pas de silence (« {m and m["titre"]} »)')
    fermer(B)
    # Pisteur : récompenses, Retour au village, bouton « Enquête 2 »
    taper(P, vic); histoire(P)
    P.click('[data-act=fin-retour]'); P.wait_for_timeout(150)
    P.click('[data-act=nouvelle-enquete]'); P.wait_for_timeout(200)
    arrive_e2(P, 'pisteur', 'Retour au village puis bouton « Enquête 2 »')
    # Alchimiste : récompenses, Retour au village, code de victoire tapé au village, code de l'enquête 2 tapé trop tôt
    taper(A, vic); histoire(A)
    A.click('[data-act=fin-retour]'); A.wait_for_timeout(150)
    taper(A, vic, onglet=False); m = modal(A)
    verif(m is not None and 'déjà finie' in m['titre'], f'Alchimiste au village : le code de victoire dit « {m and m["titre"]} »'); fermer(A)
    taper(A, e2moment, onglet=False); m = modal(A)
    verif(m is not None and 'Commence d\'abord l\'enquête 2' in m['titre'], f'Alchimiste au village : un code de l\'enquête 2 tapé trop tôt dit « {m and m["titre"]} »'); fermer(A)
    taper(A, [suite[1], suite[0], suite[2]] if suite[0] != suite[1] else [suite[2], suite[0], suite[1]], onglet=False); m = modal(A)
    verif(m is not None and m['titre'] in ('Ce code ne marche pas', 'Ce code ne sert plus', 'Commence d\'abord l\'enquête 2'), f'Alchimiste au village : un code faux dit « {m and m["titre"]} »'); fermer(A)
    taper(A, suite, onglet=False)
    arrive_e2(A, 'alchimiste', 'Retour au village, codes divers, puis code au village')
    shot(A, 'alchi-lettre-e2', True)
    for r in ROLES:
        J[r].context.close()

    print('ERREURS :', erreurs)
    print('ÉCHECS :', echecs)
    b.close()
