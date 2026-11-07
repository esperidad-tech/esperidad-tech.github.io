"""Test des systèmes de saison sur 4 écrans (Playwright) : passage E1 → E2 → E3 par le code du Sage,
journal par enquête, cœurs et défaite par code, « Supprimer le personnage », réserve d'actions du Sage (page « Donner une action » de son Grand Livre,
testée dans l'enquête 2 : l'enquête 1 n'a pas de points d'action).
Usage : BRUMEVAL_DIST=/chemin python3 tools/systemes.py
Les mini-jeux ne sont pas joués : l'accusation est faite directement avec la bonne (ou la mauvaise) réponse."""
import os, sys
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'systemes')
os.makedirs(OUT, exist_ok=True)
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']
erreurs, echecs = [], []
n = [0]

def shot(pg, nom, full=False):
    n[0] += 1
    pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png', full_page=full)

def verif(cond, msg):
    print(('  ok   ' if cond else '  ÉCHEC ') + msg)
    if not cond: echecs.append(msg)

def ev(pg, js):
    return pg.evaluate(js)

def creer(b, role):
    pg = b.new_context(viewport={'width': 800 if role in ('pisteur', 'barde') else 390, 'height': 1000}).new_page()
    pg.set_default_timeout(15000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.add_init_script('window.BRUMEVAL_SANS_TUTO = true')   # ce banc teste d'autres systèmes : l'enquête 1 sans le tutoriel guidé (tools/tuto.py teste le tutoriel)
    pg.goto(URL, wait_until='domcontentloaded', timeout=30000)
    pg.wait_for_selector('[data-act=creer]', timeout=20000)
    pg.click('[data-act=creer]')
    pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-hasard]')
    pg.click('[data-act=crea-suite]')
    pg.fill('#nom', role.capitalize())
    verif(pg.locator('[data-act=crea-joueur]').count() == 0, f'{role} : plus de question « enfant ou adulte » à la création')
    pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]')
    pg.click('[data-act=commencer]')
    return pg

def taper(pg, seq, onglet=True):
    if onglet and pg.is_visible('[data-act=onglet][data-o=code]'):
        pg.click('[data-act=onglet][data-o=code]')
    for s in seq:
        pg.click(f'[data-act=sym][data-s={s}]')
    pg.wait_for_timeout(450)

def fermer(pg):
    pg.wait_for_timeout(120)
    pg.evaluate('() => { if(M.UI.modal) M.fermer(); }')
    pg.wait_for_timeout(80)

def livre(pg, page):
    """Le Grand Livre du Sage : ouvre l'onglet, puis va à la page (« accusation », « codes » des moments…)."""
    if not pg.is_visible('#livre-ici'):
        pg.click('[data-act=onglet][data-o=role]')
    pg.evaluate(f"() => M.livreAller('{page}', true)")
    pg.wait_for_timeout(120)

def accuser(S, bonne):
    # (l'enquête 2 : il y a un POURQUOI ; plus de verrou de l'accusation ni de petit matin depuis le 5 novembre, 01 h 36)
    sol = ev(S, "() => { var E = M.E(); return {qui:E.qui.choix, sol:E.solution, dims:['qui','ou','quoi','pourquoi'].filter(function(d){ return E[d]; }), ch:{ou:E.ou && E.ou.choix.map(function(c){return c.id;}), quoi:E.quoi && E.quoi.choix.map(function(c){return c.id;}), pourquoi:E.pourquoi && E.pourquoi.choix.map(function(c){return c.id;})}}; }")
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

def jusqu_aux_recompenses(pg):
    for i in range(12):
        if pg.is_visible('[data-act=fin-suite]'):
            pg.click('[data-act=fin-suite]'); pg.wait_for_timeout(60)

def gagner_et_passer(J, eid, direct=None):
    """Le Sage gagne l'enquête eid ; les autres tapent le code de victoire, puis le code de l'enquête suivante.
    `direct` : un rôle qui tape directement le code de l'enquête suivante, sans le code de victoire."""
    S = J['sage']
    accuser(S, True)
    vic = ev(S, "() => M.code('victoire:' + Math.min(M.P().erreurs, 3))")
    S.click('#voile [data-act=fin-sage]')
    autres = [r for r in ROLES if r != 'sage']
    for r in autres:
        if r != direct:
            taper(J[r], vic)
    for r in ROLES:
        if r != direct: jusqu_aux_recompenses(J[r])
    shot(S, f'sage-recompenses-e{eid}', True)
    verif(S.is_visible('[data-act=suite-sage]'), f'E{eid} : le Sage voit le bouton et le code pour l\'enquête suivante')
    suite = ev(S, "() => M.code('suite:' + Math.min(M.P().fin.erreurs || 0, 3))")
    shot(J['barde'], f'barde-recompenses-e{eid}', True)
    S.click('[data-act=suite-sage]'); S.wait_for_timeout(200)
    for r in autres:
        taper(J[r], suite, onglet=(r == direct))
        fermer(J[r])
    for r in ROLES:
        st = ev(J[r], "() => [M.P() && M.P().id, M.P() && M.P().etape, M.UI.ecran, M.S.xp, M.niveau(M.S.xp).n]")
        verif(st[0] == eid + 1 and st[1] == 'lettre' and st[2] == 'enquete', f'E{eid}→E{eid+1} : {r} est au début de l\'enquête {eid+1} ({st})')
        verif(st[4] == eid + 1, f'{r} est niveau {eid+1} au début de l\'enquête {eid+1} (xp {st[3]})')
    shot(J['pisteur'], f'pisteur-lettre-e{eid+1}')
    for r in ROLES:
        J[r].click('[data-act=commencer]')
        J[r].wait_for_selector('[data-act=onglet][data-o=carnet]')
        # (au début de l'enquête 2, le talent du niveau 2 est à choisir : tools/partie2.py teste le choix forcé ; ici, on le prend directement)
        ev(J[r], "() => { var a = M.talentsEnAttente(); if(a.indexOf(2) >= 0){ M.S.talents.push(DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]); M.sauver(); M.render(); } }")

with sync_playwright() as p:
    b = p.chromium.launch()
    J = {r: creer(b, r) for r in ROLES}
    S = J['sage']
    # L'enquête 1 n'a pas de points d'action (E.sansActions, 4 novembre) : les actions et la réserve du Sage sont testées dans l'enquête 2, plus bas
    verif(all(ev(J[r], '() => M.sansActions() && M.peutAgir()') for r in ROLES), 'E1 : pas de points d\'action, chacun peut toujours agir (M.sansActions)')
    # Enfant ou adulte (4 novembre) : l'enfant joue au niveau 1 à l'enquête 1, l'adulte au niveau 5
    na = ev(J['barde'], "() => MJ.reglages('tir', 2, {}).niveauEffectif")
    ne = ev(J['pisteur'], "() => { M.S.heros.joueur = 'enfant'; M.sauver(); M.render(); var r = [window.MJ_JOUEUR, MJ.reglages('tir', 2, {}).niveauEffectif]; M.S.heros.joueur = 'adulte'; M.sauver(); M.render(); return r; }")
    verif(na == 5 and ne == ['enfant', 2], f'Mini-jeux à l\'enquête 2 : adulte niveau 5, enfant niveau 2 ({na} / {ne})')
    # --- E1 sans points d'action : ni « 💡 Donner une action » dans le Carnet, ni page du Grand Livre ---
    S.click('[data-act=onglet][data-o=carnet]'); S.wait_for_timeout(150)
    verif(S.locator('[data-act=reserve]').count() == 0, 'Carnet du Sage : plus de « 💡 Donner une action » (il est dans le Grand Livre)')
    livre(S, 'codes')
    pagesE1 = ev(S, "() => Array.from(document.querySelectorAll('.lv-page')).map(function(s){ return s.dataset.id; })")
    verif('actions' not in pagesE1 and S.locator('[data-act=reserve]').count() == 0, f'E1 (sans points d\'action) : pas de page « Donner une action » dans le Grand Livre ({pagesE1})')
    # --- Une erreur, puis victoire et passage à l'enquête 2 ---
    accuser(S, False); shot(S, 'sage-erreur'); fermer(S)
    verif(ev(S, '() => M.coeurs()') == 2, 'Une fausse accusation fait perdre un cœur')
    gagner_et_passer(J, 1)
    # --- Journal par enquête ---
    print('  état barde :', ev(J['barde'], "() => [M.UI.ecran, M.P() && M.P().etape, M.UI.modal && M.UI.modal.type, document.querySelector('#app').innerText.slice(0,200)]"))
    J['barde'].click('[data-act=onglet][data-o=carnet]')
    shot(J['barde'], 'barde-journal-e2', True)
    verif(J['barde'].is_visible('[data-act=journal][data-e="1"]'), 'Journal : onglet « Enquête 1 » visible dans l\'enquête 2')
    if J['barde'].is_visible('[data-act=journal][data-e="1"]'):
        J['barde'].click('[data-act=journal][data-e="1"]'); shot(J['barde'], 'barde-journal-e1', True)
        J['barde'].click('[data-act=journal][data-e="2"]')
    verif(ev(J['barde'], "() => !!(M.S.journal && M.S.journal[1])"), 'Le carnet de l\'enquête 1 est gardé')
    cal1 = ev(J['barde'], "() => M.S.calepin.filter(function(c){ return c.e === 1; }).map(function(c){ return c.t; })")
    verif(cal1 == ev(J['barde'], "() => ENQUETES[1].fin.calepin.map(function(c){ return c.t; })") and not any('CORBEAU' in t or 'fer noir' in t for t in cal1),
          f'Calepin de l\'enquête 1 : la nouvelle fin (trou, planches), sans Corbeau ni « fer noir » ({len(cal1)} lignes)')
    # --- E2 (la rivière rouge) : pas de points d'action non plus, donc ni réserve du Sage ni page « 💡 Donner une action ».
    #     (Plus aucune enquête jouable n'a de points d'action : l'enquête 3 est en cours d'écriture. La réserve n'est plus testée ici.) ---
    verif(all(ev(J[r], '() => M.sansActions() && M.peutAgir()') for r in ROLES), 'E2 : pas de points d\'action non plus (M.sansActions)')
    livre(S, 'codes')
    pagesE2 = ev(S, "() => Array.from(document.querySelectorAll('.lv-page')).map(function(s){ return s.dataset.id; })")
    verif('actions' not in pagesE2 and S.locator('[data-act=reserve]').count() == 0, f'E2 : pas de page « Donner une action » ({pagesE2})')
    if False and S.is_visible('.lv-page.on [data-act=reserve]'):   # l'ancien test de la réserve, gardé pour une future enquête avec des points d'action
        S.click('.lv-page.on [data-act=reserve]'); shot(S, 'sage-reserve')
        S.click('#voile [data-act=don-action][data-r=barde]')
        code = ev(S, "() => M.UI.modal && M.code(M.UI.modal.code)")
        shot(S, 'sage-don-barde')
        S.click('#voile [data-act=don-donne]')
        avant = ev(J['barde'], '() => M.P().actions')
        taper(J['barde'], code); fermer(J['barde'])
        verif(ev(J['barde'], '() => M.P().actions') == avant + 1, 'Le Barde reçoit 1 action')
        taper(J['barde'], code); fermer(J['barde'])
        verif(ev(J['barde'], '() => M.P().actions') == avant + 1, 'Le même code ne marche pas deux fois')
        avantP = ev(J['pisteur'], '() => M.P().actions')
        taper(J['pisteur'], code); fermer(J['pisteur'])
        verif(ev(J['pisteur'], '() => M.P().actions') == avantP, 'Le code du Barde ne marche pas pour le Pisteur')
        verif(ev(S, '() => M.reserve()') == 2, 'Il reste 2 actions dans la réserve')
        verif(S.locator('.lv-page.on .lv-ampoule').count() == 3 and S.locator('.lv-page.on .lv-ampoule.pleine').count() == 2 and '(2)' in S.inner_text('.lv-page.on [data-act=reserve]'),
              'La page du Grand Livre montre la réserve : 2 ampoules allumées sur 3, « Donner une action (2) »')
    # --- (E2 → E3 : l'enquête 3 est « en cours d'écriture », pas jouable ; tools/partie2.py vérifie son écran) ---
    # --- E2 : élixir, puis trois erreurs = défaite ---
    accuser(S, False); fermer(S)
    ev(S, "() => { M.P().potions.coeur = 1; }")
    livre(S, 'accusation'); S.click('[data-act=accuser]'); S.wait_for_timeout(100)
    verif(S.is_visible('#voile [data-act=elixir]'), 'Accusation : bouton « Boire l\'élixir »')
    if S.is_visible('#voile [data-act=elixir]'):
        S.click('#voile [data-act=elixir]'); S.wait_for_timeout(100)
        verif(ev(S, '() => M.coeurs()') == 3, 'L\'élixir rend un cœur')
        fermer(S)
    for i in range(3):
        accuser(S, False)
        if i < 2: fermer(S)
    shot(S, 'sage-defaite')
    verif(ev(S, '() => !!M.P().defaite'), 'Trois erreurs : défaite')
    dcode = ev(S, "() => M.code('defaite:0')")
    for r in ('pisteur', 'alchimiste', 'barde'):
        taper(J[r], dcode); fermer(J[r])
        verif(ev(J[r], '() => !!(M.P() && M.P().defaite)'), f'{r} reçoit la défaite par code')
    shot(J['barde'], 'barde-defaite', True)
    # L'atelier décoré avant la défaite (murs, carton du coin, chat) : il doit repartir à neuf
    ev(J['alchimiste'], "() => { var a = M.S.atelier || (M.S.atelier = Atelier.etatNeuf()); a.deco.fond = 3; a.theme = 2; a.reserve.push({id:'vx', t:'vase', st:2}); a.objets.push({id:'tq', t:'tapis', st:4, x:500, y:700}); a.marque = 1; M.sauver(); }")
    for r in ROLES:
        pg = J[r]
        for i in range(8):
            if pg.is_visible('[data-act=defaite-suite]'): pg.click('[data-act=defaite-suite]'); pg.wait_for_timeout(60)
        pg.click('[data-act=defaite-fin]'); pg.wait_for_timeout(150)
        st = ev(pg, "() => [M.S.heros, M.S.xp, M.UI.ecran, (M.S.legendes || []).length, !!M.S.ancien]")
        verif(st[0] is None and st[1] == 0 and st[2] == 'creation' and st[3] == 1 and st[4], f'{r} : héros effacé, légende gardée, retour à la création ({st[1:]})')
    shot(J['alchimiste'], 'alchi-recreation')
    A = J['alchimiste']
    verif(A.is_visible('[data-act=crea-meme]'), 'Création : « Reprendre la même apparence »')
    if A.is_visible('[data-act=crea-meme]'):
        A.click('[data-act=crea-meme]'); A.wait_for_timeout(100)
        verif(ev(A, '() => M.UI.crea.role') == 'alchimiste', 'Même apparence : même rôle repris')
        A.click('[data-act=crea-fin]'); A.wait_for_timeout(150)
        neuf = "() => { var a = M.S.atelier; if(!a) return 'absent'; var n = Atelier.normaliser(Atelier.etatNeuf()); return !a.marque && a.deco.fond === 0 && !a.theme && !a.reserve.length && !a.objets.some(o => o.id === 'tq') && a.objets.length <= n.objets.length ? 'neuf' : JSON.stringify([a.deco, a.theme, a.reserve.length, a.objets.length, n.objets.length]); }"
        st = ev(A, neuf)
        hero_ok = ev(A, '() => M.S.heros.role === "alchimiste" && M.S.xp === 0')
        verif(st in ('absent', 'neuf') and hero_ok, f'Nouveau héros après une défaite : l\'atelier repart à neuf ({st})')
        verif(not ev(A, '() => !!(M.S.ancien && M.S.ancien.atelier)'), 'Après une défaite : aucun atelier mis de côté (seulement l\'apparence)')
        A.click('[data-act=nouvelle-enquete]'); A.click('[data-act=commencer]')
        st = ev(A, neuf)
        verif(st == 'neuf', f'Première enquête du nouveau héros : atelier tout neuf, sans la décoration d\'avant ({st})')
        # Boutique en pleine enquête (la bourse 👛 de l'écran du héros), et revente à moitié prix
        ev(A, '() => { M.S.or = 500; M.sauver(); M.render(); }')
        A.click('.b-et-heros'); A.click('.hr-bourse')
        A.click('[data-act=acheter]:not([disabled])'); fermer(A)
        id_prix = ev(A, '() => { var id = M.S.equip[0]; return [id, DONNEES.OBJETS[id].prix, M.S.or]; }')
        A.click(f'[data-act=revendre][data-id={id_prix[0]}]'); A.click('#voile [data-act=confirmer-oui]'); A.wait_for_timeout(100)
        shot(A, 'alchi-boutique-revente', True)
        verif(ev(A, '() => M.S.or') == id_prix[2] + id_prix[1] // 2 and ev(A, '() => M.S.equip.length') == 0, f'Revente à moitié prix ({id_prix})')
        A.click('[data-act=retour]'); A.wait_for_timeout(100)
        verif(ev(A, '() => M.UI.ecran') == 'heros', '« ← Retour » de la boutique revient à l\'écran du héros')
        A.click('[data-act=retour]'); A.wait_for_timeout(100)
        verif(ev(A, '() => M.P().etape') == 'jeu' and ev(A, '() => M.UI.ecran') == 'enquete', 'Retour à l\'enquête après la boutique')
        # Supprimer le personnage (à la place d'« Abandonner ») : comme une défaite, sans toucher aux autres tablettes
        A.click('[data-act=menu-enquete]'); A.click('[data-act=supprimer]'); A.click('#voile [data-act=confirmer-oui]'); A.wait_for_timeout(150)
        shot(A, 'alchi-supprime')
        st = ev(A, "() => { var L = M.S.legendes; return [M.S.heros, M.UI.ecran, L.length, L[L.length - 1].fin, !!L[L.length - 1].look, !!M.S.ancien]; }")
        verif(st[0] is None and st[1] == 'creation' and st[2] == 2 and st[3] == 'supprime' and st[4] and st[5], f'Supprimer le personnage : Livre des Légendes, puis création ({st})')
    print('ERREURS :', erreurs)
    print('ÉCHECS :', echecs)
    b.close()
