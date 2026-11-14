"""Partie complète de la NOUVELLE enquête 2 (« La rivière rouge », DESIGN-saison1.md § 12.11) sur 4 tablettes (Playwright, téléphones 390×844).
Elle suit le chemin prévu, moment par moment (matin, après-midi, nuit), et passe les codes d'une tablette à l'autre comme les joueurs.
Les mini-jeux sont court-circuités (réussite immédiate) ; les mensonges du Barde se démasquent avec 🤥 (pas de mini-jeu à part).
Vérifie au passage : le choix forcé du talent, l'affiche, le garde du Vieux Chêne, Gaspard dès le matin, les boîtes des questions,
les signes du matin (étiquettes du liège), l'accusation à tort qui vexe, la potion offerte avant les questions, la brume de la clairière,
« une seule visite par moment » (Encore toi ? / Tu as du nouveau ?), les signes de Margot, la potion de vérité, J'exige la vérité,
la pierre de Tim, le rassemblement du Sage (chaque nuit, sans preuves : le Grand Livre s'y ouvre tout seul), le pot qui change,
l'accusation libre (dès le matin, plus de verrou ni de petit matin), l'accusation QUI/OÙ/POURQUOI, la fin.
Le chemin des bûcherons (Romain, 5 novembre, 01 h 30) : pour le Pisteur seul ; tapé, il l'emmène à son tableau « Les chemins secrets »,
le chemin se trace, le rond jaune palpite (et la bulle), le toucher le mène au Vieux Chêne. Le maire ne parle plus d'éboulement.
Usage : python3 tools/partie2.py [exiger|tendre]   (le talent du Barde ; exiger par défaut)"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
TALENT = sys.argv[1] if len(sys.argv) > 1 and sys.argv[1] in ('exiger', 'tendre') else 'exiger'
# « secours » : les chemins de secours (§ 12.11, « deux chemins pour chaque passage obligé ») : passer derrière le dos du garde (Se cacher)
# au lieu du chemin des bûcherons, Tim ouvert par son signe (Margot) au lieu de la poursuite, les traces de la clairière ratées deux fois
# (le code est donné quand même), et la nuit, guetter au moulin AVANT le plan du Sage (sans lui, jamais de pièce cachée : Romain, 5 novembre,
# 00 h 27) ; le plan arrive ensuite dans la nuit, et le Pisteur revient au moulin.
SECOURS = 'secours' in sys.argv
OUT = os.path.join(ICI, '..', 'test', 'partie2-' + TALENT + ('-secours' if SECOURS else ''))
os.makedirs(OUT, exist_ok=True)
ROLES = ['pisteur', 'alchimiste', 'barde', 'sage']
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1
    pg.wait_for_timeout(250)
    pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    if not cond: echecs.append(quoi); print('  ✗', quoi)

def creer(b, role):
    pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{role}] {m.text}') if m.type == 'error' and 'ERR_TUNNEL' not in m.text and 'fonts' not in m.text and 'net::' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{role}] PAGEERROR {e}'))
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
    # le Mode test des Réglages (comme tools/bot.py) : l'enquête 2 devient la prochaine, le héros passe au niveau 2
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]')
    verifier(pg.locator('.b-affiche').count() == 1, f'{role} : l\'affiche du maire sous la lettre')
    if role == 'pisteur': shot(pg, 'lettre-affiche')
    pg.click('[data-act=commencer]')
    # (window.__rate : les mini-jeux qu'on rate exprès, pour les chemins de secours)
    pg.evaluate("""() => { window.__rate = []; MJ.lancer = function(el, type, params, fin){ window.__mj = (window.__mj || []).concat([type]); window.__niv = (window.__niv || []).concat([[type, params.niveauEffectif]]); var ok = window.__rate.indexOf(type) < 0; setTimeout(function(){ fin({reussi:ok, score:ok ? 1 : 0, essais:1}); }, 30); return {arreter:function(){}}; }; }""")
    return pg

def talent(pg, role, tid):
    """Le choix forcé du talent du niveau 2, par de vrais clics : le portrait, 🌳, le talent, « Je prends ce talent ».
    (force=True : le bouton que le tutoriel montre « respire » sans arrêt, tuto.css .tu-respire ; Playwright attendrait qu'il s'arrête)"""
    verifier(pg.evaluate('() => !!M.tutoTalentForce()'), f'{role} : le talent du niveau 2 est forcé au début de l\'enquête 2')
    pg.click('.b-entete .b-et-heros', force=True); pg.wait_for_timeout(200)
    pg.click('[data-act=hr-arbre]', force=True); pg.wait_for_timeout(200)
    if not tid: tid = pg.evaluate("() => DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]")
    pg.click(f'[data-act=hr-talent][data-id={tid}]', force=True); pg.wait_for_timeout(150)
    pg.click('#voile [data-act=talent]', force=True); pg.wait_for_timeout(150)
    pg.evaluate("() => { M.UI.modal = null; M.UI.ecran = 'enquete'; M.render(); }")
    verifier(pg.evaluate(f"() => M.S.talents.indexOf('{tid}') >= 0 && !M.tutoTalentForce()"), f'{role} : talent {tid} choisi, plus rien de bloqué')

def ev(pg, act, data=None, go=True):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}}}); }}")
    pg.wait_for_timeout(90)
    # (11 novembre) l'enquête 2 passe par le labo : « Analyser » l'ouvre. Le robot ne joue pas l'analyse (tools/labo-e2.py le fait) :
    # il boucle ce dossier-là et revient à l'atelier, où la fiche de la découverte s'ouvre.
    if act == 'analyser' and pg.locator('#labo-cadre').count():
        pg.wait_for_timeout(900)
        f = next((x for x in pg.frames if x.parent_frame is not None), None)
        f.wait_for_function('() => !!window.__labo', timeout=8000)
        f.evaluate(f"() => {{ window.__labo.finir('{(data or {}).get('id')}'); window.__labo.quitter(); }}"); pg.wait_for_timeout(900)
    # l'explication avant un mini-jeu (Romain, 23 h 11) : on touche le bouton jaune (go=False : on s'arrête dessus, pour la regarder)
    if go and act != 'mj-go' and pg.evaluate("() => !!(M.UI.modal && M.UI.modal.type === 'avant-mj')"): ev(pg, 'mj-go')

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }")

def modal(pg):
    return pg.evaluate("() => M.UI.modal ? {type:M.UI.modal.type, titre:M.UI.modal.titre || '', t:M.UI.modal.t || '', code:M.UI.modal.code || null, id:M.UI.modal.id || null} : null")

def entrer(pg, cid, src):
    seq = src.evaluate(f"() => M.code('{cid}')")
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(400)
    m = modal(pg)
    ok = pg.evaluate(f"() => {{ var P = M.P(), c = '{cid}'; if(c.indexOf('moment:') === 0) return P.moment === +c.split(':')[1]; if(c.indexOf('victoire:') === 0) return P.etape === 'fin'; if(c.indexOf('pot:') === 0) return (P.potions[c.slice(4)] || 0) > 0; return !!P.recus[c]; }}")
    verifier(ok, f'code {cid} bien reçu ({m and m["titre"]})')
    fermer(pg)

def donner(src, cid, *dests):
    # trouvé : dans le sac (P.objets), ou donné par une analyse faite (l'analyse montre son code dans la découverte)
    verifier(src.evaluate(f"() => {{ var P = M.P(), E = M.E(), c = '{cid}'; return !!(P.objets['_' + c] || P.objets[c.split(':')[1]] && c.indexOf('obj:') === 0 || Object.keys(P.analyses || {{}}).some(function(a){{ return (M.texteAnalyse((E.analyses || {{}})[a]) || {{}}).donne === c; }})); }}"), f'{cid} trouvé par {src.evaluate("() => M.role()")}')
    for d in dests: entrer(J[d], cid, src)

def explorer(pg, lieu, points, photo=None):
    ev(pg, 'lieu', {'id': lieu}); ev(pg, 'explorer', {'id': lieu})
    for p in points:
        ev(pg, 'point', {'l': lieu, 'id': p}); pg.wait_for_timeout(150)
        verifier(pg.evaluate(f"() => M.P().vus['{M_ROLE[pg]}:{lieu}:{p}'] === 'ok'"), f'{M_ROLE[pg]} : {lieu} / {p} vu')
        if photo and photo[0] == p: shot(pg, photo[1])
        fermer(pg)

def parler(pg, pid, questions, maison=None):
    """Une visite : on ouvre la conversation, puis on pose les questions [(i, choix)]."""
    if maison: ev(pg, 'frapper', {'id': maison})
    else: ev(pg, 'parler', {'id': pid})
    for i, c in questions:
        d = {'p': pid, 'i': str(i)}
        if c == 'bon': c = pg.evaluate(f"() => M.E().pnj['{pid}'].questions[{i}].choix.findIndex(function(x){{ return x.bon; }})")   # le bon choix (sa place change)
        if c is not None: d['c'] = str(c)
        ev(pg, 'question', d); pg.wait_for_timeout(60)
        verifier(pg.evaluate(f"() => M.P().vus['barde:{pid}:{i}'] === 'ok'"), f'Barde : {pid} répond à la question {i}')

def demasquer(pg, pid, i):
    ev(pg, 'bd-ment', {'p': pid, 'i': str(i)})
    verifier(pg.evaluate(f"() => !!M.P().vus['verite:{pid}:{i}']"), f'Barde : {pid} démasqué ({i})')

def mode_bd(pg):
    return pg.evaluate("() => M.UI.bd ? M.UI.bd.mode : null")

def passer(m):
    S = J['sage']
    ev(S, 'moment-suivant'); ev(S, 'passer-moment'); fermer(S)
    for r in ROLES[:3]: entrer(J[r], f'moment:{m}', S)

with sync_playwright() as p:
    b = p.chromium.launch()
    J = {r: creer(b, r) for r in ROLES}
    M_ROLE = {J[r]: r for r in ROLES}
    # (11 novembre : seul le Barde a des talents à choisir ; les talents des trois autres rôles sont à refaire)
    talent(J['barde'], 'barde', TALENT)
    for r in ROLES:
        if r != 'barde': verifier(not J[r].evaluate('() => !!M.tutoTalentForce()'), f'{r} : pas de talent à choisir au début de l\'enquête 2')
    P, A, B, S = J['pisteur'], J['alchimiste'], J['barde'], J['sage']
    verifier(S.evaluate("() => M.E().id === 2 && M.sansActions() && M.E().moments.join(',') === 'matin,apresmidi,nuit'"), 'enquête 2 sans actions, matin / après-midi / nuit')

    # ================= MATIN =================
    print('— matin')
    ev(S, 'page', {'id': 'habitants'})   # (plus de code du registre pour le Barde : Romain, 5 novembre, 01 h 20)
    verifier(S.evaluate("() => !M.E().infos.registre && !(M.E().pages.filter(function(p){ return p.id === 'habitants'; })[0] || {}).donne"), 'Sage : « Les habitants » ne donne plus de code')
    reg = S.evaluate("() => { var E = M.E(); return Object.keys(E.registre).map(function(id){ var r = E.registre[id], x = DONNEES.PNJ[id]; return [id, !!(r.maison || r.adresse), !!x.metier, !!x.pied, !!r.note]; }); }")
    verifier(all(all(x[1:]) for x in reg), f'Sage : chaque habitant du registre a un métier, une adresse, des pieds et une phrase ({[x[0] for x in reg if not all(x[1:])]})')
    # les deux pages de toutes les enquêtes, toujours ouvertes, qui ne disent pas quoi chercher (Romain, 4 novembre, 21 h 12)
    S.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('bibliotheque', true); }"); S.wait_for_timeout(200)
    t_bib = S.inner_text('#livre-ici .lv-page.on')
    verifier('Les vieux chemins' in t_bib and 'Ici sont rangés' not in t_bib and 'Le plan du moulin' not in t_bib and 'marcherait' not in t_bib.lower() and S.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0, 'Sage : la bibliothèque des plans au début : les vieux chemins (menu replié), pas le plan du moulin, plus de texte (15 h 05)')
    S.evaluate("() => { document.querySelector('#livre-ici .lv-page.on [data-act=bib-plier][data-id=chemins]').click(); }"); S.wait_for_timeout(300)
    verifier(S.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=chemins]').count() == 1, 'Sage : les vieux chemins se déplient, avec « Superposer les vieux chemins »')
    shot(S, 'sage-bibliotheque-chemins')
    S.evaluate("() => M.livreAller('objets', true)"); S.wait_for_timeout(200)
    verifier('Lanterne d\'Or' in S.inner_text('#livre-ici .lv-page.on') and S.locator('#livre-ici .lv-page.on [data-act=ouvrir-page]').count() == 0, 'Sage : les objets magiques, la Lanterne d\'Or, pas encore la pierre')
    verifier(S.evaluate("() => [].map.call(document.querySelectorAll('#livre-ici .lv-page'), function(x){ return x.dataset.id; }).join(',')") == 'tableau,lettre,habitants,recettes,bibliotheque,objets,archives,codes,accusation', 'Sage : les pages du livre de l\'enquête 2 (sans les fondateurs ; 📣 le rassemblement ; ✉️ la lettre et 🗄️ les archives, 14 h 26)')
    verifier(P.evaluate("() => !!M.verrouLieu('chene')"), 'Pisteur : le Vieux Chêne est gardé au départ')
    explorer(P, 'foret', ['branche'])
    # passer derrière Silas (Romain, 23 h 13) : d'abord l'explication « très risqué » et le bouton jaune, puis « Se cacher » au niveau 10
    ev(P, 'lieu', {'id': 'foret'}); ev(P, 'point', {'l': 'foret', 'id': 'passer'}, go=False); P.wait_for_timeout(200)
    m = modal(P) or {}
    verifier(m.get('type') == 'avant-mj' and 'très, très discret' in m.get('t', '') and P.locator('#voile .b-avant-mj .b-aller[data-act=mj-go]').count() == 1, 'Pisteur : avant de passer derrière Silas, l\'explication « très risqué » et un bouton jaune')
    shot(P, 'avant-passer-silas')
    if not SECOURS:
        # raté (exprès) : il faudra le chemin du Sage ; le niveau est 10, quel que soit le joueur
        P.evaluate("() => { window.__rate = ['cachette']; window.__niv = []; }")
        P.click('#voile .b-avant-mj [data-act=mj-go]'); P.wait_for_timeout(300)
        niv = P.evaluate("() => window.__niv")
        verifier(niv and niv[-1][0] == 'cachette' and niv[-1][1] >= 9, f'Pisteur : passer derrière Silas, « Se cacher » au niveau 10 (niveau effectif {niv and niv[-1][1]})')
        verifier(P.evaluate("() => M.P().vus['pisteur:foret:passer'] === 'rate' && !!M.verrouLieu('chene')"), 'Pisteur : raté, le Vieux Chêne reste gardé')
        P.evaluate("() => { window.__rate = []; }"); fermer(P)
    else: fermer(P)
    if SECOURS:
        explorer(P, 'foret', ['passer'])
        verifier(not P.evaluate("() => !!M.verrouLieu('chene')"), 'Pisteur (secours) : passer derrière le dos du garde ouvre le Vieux Chêne')
    else:
        ev(S, 'ouvrir-page', {'id': 'chemins'}); S.wait_for_timeout(200)
        t = S.inner_text('#voile')
        verifier('toute l\'équipe' not in t and 'chacun peut le taper' not in t and 'pour le Pisteur' in t, 'Sage : le chemin des bûcherons est « un chemin secret pour le Pisteur » (plus « pour toute l\'équipe »)')
        fermer(S)
        verifier(S.evaluate("() => !!M.P().objets['_info:detour'] && M.destinataire('info:detour') === 'pisteur' && !M.codePourTous('info:detour')"), 'le code du chemin des bûcherons est pour le Pisteur seulement')
        seq = S.evaluate("() => M.code('info:detour')")
        # tapé par le Barde : ce n'est pas un code pour lui
        for s in seq: ev(B, 'sym', {'s': s})
        B.wait_for_timeout(400)
        m = modal(B) or {}
        verifier(m.get('titre') == 'Ce code est pour un équipier' and 'le Pisteur' in m.get('t', '') and not B.evaluate("() => !!M.P().recus['info:detour']"), f'Barde : le code du chemin des bûcherons « est pour le Pisteur » ({m.get("t")})')
        fermer(B)
        # tapé par le Pisteur : tout droit à son tableau « Les chemins secrets » ; le chemin se trace, le rond jaune palpite, la bulle (la première fois)
        P.evaluate("() => { M.P().onglet = 'code'; M.UI.modal = null; M.render(); }")
        for s in seq: ev(P, 'sym', {'s': s})
        P.wait_for_timeout(3600)
        verifier(P.evaluate("() => !!M.P().recus['info:detour'] && M.P().onglet === 'role' && !M.UI.modal && !!document.querySelector('#cabane-carte .ca-chemin-neuf[data-chemin=bucherons]') && !!document.querySelector('#cabane-carte .ca-chemin-depart[data-id=bucherons] .ca-chemin-onde') && !!document.querySelector('#cabane-carte .ca-chemin-bulle')"),
          'Pisteur : le code du chemin des bûcherons l\'emmène à son tableau ; le chemin se trace, le rond jaune palpite, la bulle explique')
        verifier('Les chemins secrets' in P.inner_text('#cabane-carte .ca-titre-ss') and 'Sous le village' not in P.inner_text('#cabane-carte'), 'Pisteur : le tableau du chevalet s\'appelle « Les chemins secrets »')
        verifier(not P.evaluate("() => !!M.verrouLieu('chene')"), 'Pisteur : le chemin des bûcherons ouvre le Vieux Chêne')
        shot(P, 'tableau-chemins-secrets')
        # toucher le rond jaune : il suit le chemin jusqu'au Vieux Chêne, qui s'ouvre
        P.locator('#cabane-carte .ca-chemin-depart[data-id=bucherons]').first.click(force=True); P.wait_for_timeout(500)
        verifier(P.locator('#cabane-carte .ca-chemin-pion').count() == 1, 'Pisteur : touché, le rond le fait marcher le long du chemin')
        P.wait_for_timeout(2200)
        m = modal(P) or {}
        verifier(m.get('type') == 'lieu' and m.get('id') == 'chene', f'Pisteur : au bout du chemin des bûcherons, le Vieux Chêne s\'ouvre ({m})')
        shot(P, 'chemin-vers-chene'); fermer(P); P.wait_for_timeout(900)
        verifier(P.evaluate("() => !!document.querySelector('#cabane-carte [data-chemin=bucherons]') && !document.querySelector('#cabane-carte .ca-chemin-bulle') && !document.querySelector('#cabane-carte .ca-chemin-onde') && !!M.S.sousSols.pris.bucherons"), 'Pisteur : ensuite, le chemin reste sur le tableau (plus de bulle ni de rond qui palpite)')
        ev(P, 'chemin', {'id': 'bucherons'}); P.wait_for_timeout(300)
        verifier((modal(P) or {}).get('id') == 'chene', 'Pisteur : retoucher le chemin ramène au Vieux Chêne')
        fermer(P)
    explorer(P, 'chene', ['ouvriers', 'canne', 'tim'], photo=('ouvriers', 'chene-matin'))
    # (Romain, 13 novembre : le pot noir dès le matin)
    verifier(P.evaluate("() => M.pointsVisibles('chene', 'pisteur').map(function(x){ return x.id; }).join(',')") == 'ouvriers,pot,canne,tim', 'Pisteur : le matin au chêne, les ouvriers et le pot noir (pas encore les rochers)')
    donner(P, 'info:canne', 'sage', 'barde')
    if not SECOURS: donner(P, 'info:tim_chene', 'barde')
    explorer(P, 'clairiere', ['brume'])
    verifier('champ' not in P.evaluate("() => M.pointsVisibles('clairiere', 'pisteur').map(function(x){ return x.id; })"), 'Pisteur : la brume du matin cache les traces de la clairière')
    explorer(P, 'moulin', ['cour'])
    # Alchimiste : les deux flacons, la cueillette, les analyses, la potion de vérité
    for l in ['pont', 'lavoir']:
        ev(A, 'lieu', {'id': l}); verifier(A.locator('#voile [data-act=echantillon]').count() == 1, f'Alchimiste : « Remplir un flacon » au {l}')
        ev(A, 'echantillon', {'id': l}); fermer(A)
    ev(A, 'cueillir', {'id': 'herboristerie'}); fermer(A)
    for o in ['eau_riviere', 'eau_lavoir']:
        ev(A, 'analyser', {'id': o}); A.wait_for_timeout(200); fermer(A)
        verifier(A.evaluate(f"() => !!M.P().analyses['{o}']"), f'Alchimiste : analyse {o}')
    donner(A, 'info:lavoir_rose', 'barde')
    A.evaluate("""() => { var n = M.ingr(); if((n.pensee || 0) < 2) M.ajouterIngr('pensee', 2); if((n.miel || 0) < 1) M.ajouterIngr('miel', 1);
      Atelier.retirer(M.S.atelier, 'pensee', 2); Atelier.retirer(M.S.atelier, 'miel', 1); M.S.fioles--; M.S.potions.verite = (M.S.potions.verite || 0) + 1; M.sauver(); M.render(); }""")
    ev(A, 'potion-donnee', {'id': 'verite'}); entrer(B, 'pot:verite', A)
    # Barde : Iris, Mélusine au lavoir, Silas, Farinel, le maire, Gaspard (dès le matin), la maison d'Odette
    if TALENT == 'tendre':
        # (Romain, 5 novembre, 12 h 31 : écouter aux portes, tout le temps, sans phrase à trous ; barde.js : A['bd-porte'])
        # (11 novembre : plus de bribe au fournil, doublon de la pièce que Gaspard donne)
        verifier(not any(b['id'] == 'boulangerie' for b in B.evaluate("() => M.E().bribes")), 'Tendre l\'oreille : plus de bribe au fournil (doublon de la pièce)')
    # Iris d'abord : son champ, puis le signe de Mélusine (un signe de menteur dès le matin : une étiquette du liège)
    # les boîtes des questions : fermées au début (▸), pas de bulle ni de gros bouton 🤥 sous le portrait
    ev(B, 'parler', {'id': 'iris'}); B.wait_for_timeout(300)
    verifier(B.locator('#voile .bd-a-poser').count() >= 2 and B.locator('#voile details.bd-boite[open]').count() == 0 and B.locator('#voile .bd-bulle, #voile .bd-ment, #voile .bd-secret').count() == 0, 'Barde : les questions sont des boîtes fermées ; ni bulle, ni gros bouton 🤥, ni « Ton secret » sous le portrait')
    shot(B, 'boites-fermees')
    parler(B, 'iris', [(0, None), (3, None)])
    verifier(B.evaluate("() => !!M.barde.mimiques().melusine"), 'Barde (matin) : Iris révèle le signe de Mélusine')
    verifier(B.locator('#voile details.bd-boite[open]').count() == 1, 'Barde : une seule boîte ouverte (celle de la réponse)')
    B.wait_for_timeout(2500); shot(B, 'boite-ouverte-signe-matin')
    # Iris : un mauvais choix (poli) → la réplique neutre, et elle ne parle plus avant l'après-midi
    verifier(B.evaluate("() => M.barde.choixVisibles(M.E().pnj.iris.questions[1]).length === 3"), 'Barde : Iris, après sa colère, la question à choix (3 façons)')
    mauvais = B.evaluate("() => M.E().pnj.iris.questions[1].choix.findIndex(function(x){ return !x.bon; })")
    ev(B, 'question', {'p': 'iris', 'i': '1', 'c': str(mauvais)})
    verifier(mode_bd(B) == 'vexe' and B.evaluate("() => M.UI.bd.t").startswith('Hmm… je ne sais pas.') and 'vexé' not in B.inner_text('#voile'), 'Barde : Iris, un mauvais choix → la réplique neutre (sans « vexé »)')
    shot(B, 'choix-neutre')
    fermer(B)
    # Mélusine : avec son signe (appris d'Iris), son mensonge du matin (son tissu) se démasque ; elle donne celui de Fortuné
    parler(B, 'melusine', [(0, None), (1, None), (3, None), (2, None)])
    verifier(B.locator('#voile .bd-secret').count() == 0 and B.locator('#voile [data-act=bd-tableau]').count() == 1, 'Barde : chez Mélusine, pas de « Ton secret », un petit bouton « 📌 Mon tableau »')
    B.wait_for_timeout(2200); shot(B, 'melusine-signe-matin')
    # 📌 Mon tableau, puis ↩️ retour à Mélusine dans la même visite (pas « Encore toi ? »)
    ev(B, 'bd-tableau', {'p': 'melusine'}); B.wait_for_timeout(400)
    verifier(B.locator('.lg-retour').count() == 1, 'Barde : sur le tableau, le bouton ↩️ pour revenir à Mélusine')
    B.click('.lg-retour'); B.wait_for_timeout(300)
    verifier((modal(B) or {}).get('id') == 'melusine' and mode_bd(B) != 'encore', 'Barde : retour chez Mélusine, la même visite')
    demasquer(B, 'melusine', 2); fermer(B)
    parler(B, 'silas', [(0, None), (1, None), (2, None)]); fermer(B)
    parler(B, 'farinel', [(0, None), (1, None)]); demasquer(B, 'farinel', 1); fermer(B)
    verifier(B.evaluate("() => { var m = M.barde.mimiques(); return !!(m.melusine && m.farinel && m.fortune) && !m.bastien; }"), 'Barde (matin) : trois signes de menteurs appris (Mélusine, Farinel, Fortuné), pas encore celui de Bastien')
    B.evaluate("() => { M.UI.modal = null; window.__ong = M.P().onglet; M.P().onglet = 'role'; M.render(); }"); B.wait_for_timeout(500)
    verifier(B.locator('.lg-bac-carte.lg-signe').count() == 3, 'Barde (matin) : trois étiquettes de signes dans le bac du liège')
    shot(B, 'liege-matin')
    B.evaluate("() => { M.P().onglet = window.__ong; M.render(); }")
    parler(B, 'grosbec', [(0, None), (1, None)]); fermer(B)
    # le maire ne ment jamais (Romain, 5 novembre, 01 h 36) : ni son affiche, ni ses réponses ne parlent d'éboulement ; Silas, si
    verifier(B.evaluate("() => { var E = M.E(); return E.affiche.t === 'Le chemin du Vieux Chêne est fermé : danger !' && E.pnj.grosbec.questions.every(function(q){ return q.a.indexOf('boulement') < 0; }) && E.pnj.grosbec.questions[1].a.indexOf('Je ne peux pas t\\'en dire plus') >= 0 && E.pnj.silas.questions[0].a.indexOf('boulement') >= 0 && E.lieux.place.pisteur.points[0].t.indexOf('boulement') < 0; }"),
      'Le maire ne ment jamais : « C\'est très dangereux là-bas… », l\'affiche « danger ! » ; Silas garde l\'éboulement')
    # l'accusation est libre (plus de verrou ni de petit matin) : dès le matin, le Sage peut accuser
    S.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); M.livreAller('accusation', true); }"); S.wait_for_timeout(300)
    t = S.inner_text('#livre-ici .lv-page.on')
    verifier(S.locator('#livre-ici [data-act=petit-matin]').count() == 0 and 'petit matin' not in t and S.locator('#livre-ici .lv-page.on [data-act=accuser]').count() == 1, 'Sage (matin) : la page de l\'accusation, sans « petit matin » ni verrou')
    ev(S, 'accuser'); S.wait_for_timeout(200)
    verifier((modal(S) or {}).get('type') == 'accusation' and (modal(S) or {}).get('titre') != 'Pas encore !', 'Sage (matin) : il peut accuser tout de suite (plus de « Pas encore ! »)')
    shot(S, 'accusation-matin-libre')
    fermer(S)
    # Gaspard le matin (Romain, 22 h 38) : Odette, sa première cliente, n'est pas venue ; la pièce d'or et Margot : l'après-midi
    parler(B, 'gaspard', [(0, None)]); B.wait_for_timeout(4500)   # (la réponse s'écrit dans sa boîte)
    verifier('première cliente' in B.inner_text('#voile') and B.evaluate("() => M.barde.cachee('gaspard', M.E().pnj.gaspard.questions[1]) && !M.barde.cachee('gaspard', M.E().pnj.gaspard.questions[2])"), 'Barde : Gaspard parle le matin (Odette) et de Margot (dès le matin : 13 h 19) ; la pièce d\'or attend l\'après-midi')
    # « Mensonge ? » sur une vérité : il se vexe tout de suite, plus de discussion (pas de deuxième chance)
    ev(B, 'bd-ment', {'p': 'gaspard', 'i': '0'}); B.wait_for_timeout(300)
    verifier(mode_bd(B) == 'accuse' and B.evaluate("() => M.P().vexe.gaspard === M.P().moment") and B.locator('#voile .bd-boite').count() == 0, 'Barde : accusé à tort, Gaspard se vexe et ne parle plus (plus de questions)')
    B.wait_for_timeout(1500); shot(B, 'accuse-a-tort')
    fermer(B); ev(B, 'parler', {'id': 'gaspard'})
    verifier(B.locator('#voile .bd-boite').count() == 0 and B.locator('#voile [data-act=bd-pardon]').count() == 0, 'Barde : Gaspard reste fermé jusqu\'au moment suivant (pas de pardon)')
    fermer(B)
    parler(B, 'voisin', [(0, None)], maison='L2'); donner(B, 'info:odette', 'sage')
    passer(1)

    # ================= APRÈS-MIDI =================
    print('— après-midi')
    if SECOURS:
        # les traces ratées deux fois : l'indice partiel, et le code est donné quand même (ouvrePartiel)
        P.evaluate("() => { window.__rate = ['traces']; }")
        ev(P, 'lieu', {'id': 'clairiere'}); ev(P, 'explorer', {'id': 'clairiere'})
        ev(P, 'point', {'l': 'clairiere', 'id': 'champ'}); P.wait_for_timeout(200)
        verifier(P.locator('#voile .b-reessai').count() == 1, 'Pisteur (secours) : traces ratées une fois → « dernière chance »')
        ev(P, 'point', {'l': 'clairiere', 'id': 'champ'}); P.wait_for_timeout(200)
        verifier((modal(P) or {}).get('code') == 'info:traces' and P.evaluate("() => M.P().vus['pisteur:clairiere:champ'] === 'ok'"), 'Pisteur (secours) : traces ratées deux fois → l\'indice partiel, et le code quand même')
        shot(P, 'traces-ratees'); fermer(P)
        P.evaluate("() => { window.__rate = []; }")
    else:
        # (Romain, 23 h 11) l'explication avant le mini-jeu, le bouton jaune « 👣 Suivre les traces », puis le résultat dans l'histoire
        ev(P, 'lieu', {'id': 'clairiere'}); ev(P, 'explorer', {'id': 'clairiere'})
        ev(P, 'point', {'l': 'clairiere', 'id': 'champ'}, go=False); P.wait_for_timeout(200)
        bj = P.locator('#voile .b-avant-mj .b-aller[data-act=mj-go]')
        verifier((modal(P) or {}).get('titre') == 'Le champ de coquelicots' and 'tout rasé' in (modal(P) or {}).get('t', '') and bj.count() == 1 and 'Suivre les traces' in bj.inner_text(), 'Pisteur : au champ, l\'explication puis le bouton jaune « 👣 Suivre les traces »')
        shot(P, 'avant-champ')
        bj.click(); P.wait_for_timeout(400)
        t = P.inner_text('#voile')
        verifier((modal(P) or {}).get('code') == 'info:traces' and 'cour du moulin' in t and 'Farinel, le meunier, sait peut-être quelque chose : donne ce code au Barde.' in t, 'Pisteur : le résultat des traces (la cour du moulin) et « Farinel, le meunier, sait peut-être quelque chose : donne ce code au Barde. »')
        shot(P, 'champ-resultat'); fermer(P)
    donner(P, 'info:traces', 'barde')
    explorer(P, 'place', ['charrette', 'carriole'])
    explorer(P, 'chene', ['rochers', 'pot'], photo=('pot', 'pot-echantillon'))
    donner(P, 'info:rochers', 'sage')   # une preuve pour le rassemblement du Sage (un code ajouté après le gel)
    # le pot noir (Romain, 23 h 14) : une pincée pour l'Alchimiste, qui l'analyse (avant le rassemblement : de quoi faire une fumée rouge)
    donner(P, 'obj:poudre', 'alchimiste')
    # (Romain, 10 novembre, 17 h 50 : plus de mini-jeu d'analyse ; le résultat tombe tout de suite, sans écran d'explication)
    ev(A, 'analyser', {'id': 'poudre'}, go=False); A.wait_for_timeout(300)
    verifier((modal(A) or {}).get('type') != 'avant-mj' and A.locator('#voile .b-avant-mj').count() == 0, 'Alchimiste : l\'analyse de la poudre donne son résultat tout de suite (plus de mini-jeu)')
    t = (modal(A) or {}).get('t', '')
    verifier('poudre noire' in t and 'colorant rouge' in t and 'fumée' in t and 'fumigène' not in t, 'Alchimiste (avant le rassemblement) : poudre noire + colorant rouge, de quoi faire une fumée rouge')
    shot(A, 'analyse-poudre'); fermer(A)
    # le rassemblement (Sage) : seulement la nuit ; l'après-midi, pas de bouton
    # (Romain, 5 novembre, 12 h 31 : la page n'existe pas avant la nuit)
    S.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.render(); }"); S.wait_for_timeout(300)
    verifier(S.locator('#livre-ici .lv-page[data-id=rassemblement]').count() == 0, 'Sage : l\'après-midi, pas de page du rassemblement (seulement la nuit)')
    ev(A, 'cueillir', {'id': 'clairiere'})
    verifier((modal(A) or {}).get('code') == 'info:champ_rase', 'Alchimiste : le champ rasé en cueillant (trouvaille)')
    fermer(A); donner(A, 'info:champ_rase', 'barde')
    # Farinel : une seule visite par moment ; avec du nouveau (les traces), la porte se rouvre
    B.evaluate("() => { var P = M.P(); delete P.recus['info:traces']; M.sauver(); }")   # (on rejoue l'ordre : la visite d'abord, les traces ensuite)
    # (Romain, 5 novembre, 12 h 31 : la visite ne compte qu'après une question ; repartir sans rien demander laisse la porte ouverte)
    ev(B, 'parler', {'id': 'farinel'}); fermer(B)
    ev(B, 'parler', {'id': 'farinel'})
    verifier(mode_bd(B) != 'encore', 'Barde : Farinel, revenir sans avoir rien demandé : il parle encore')
    for i in range(6):
        ev(B, 'question', {'p': 'farinel', 'i': str(i)}); B.wait_for_timeout(60)
    fermer(B)
    ev(B, 'parler', {'id': 'farinel'})
    verifier(mode_bd(B) == 'encore', 'Barde : Farinel, deuxième visite sans rien de nouveau → « Encore toi ? »')
    shot(B, 'encore-toi')
    fermer(B)
    entrer(B, 'info:traces', P)
    ev(B, 'parler', {'id': 'farinel'})
    verifier(mode_bd(B) == 'nouveau', 'Barde : Farinel, avec les traces → « Tu as du nouveau ? »')
    ev(B, 'question', {'p': 'farinel', 'i': '2'}); fermer(B)
    donner(B, 'info:plans_moulin', 'sage')
    # la bibliothèque des plans (toujours ouverte) : le plan du moulin y apparaît avec le code de Farinel
    S.evaluate("() => { M.P().onglet = 'role'; M.UI.modal = null; M.UI.bibOuverts = {bibliotheque:true}; M.render(); M.livreAller('bibliotheque', true); }"); S.wait_for_timeout(200)
    verifier(S.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=bibliotheque]').count() == 1 and '🔒' not in S.inner_text('#livre-ici .lv-page.on'), 'Sage : avec le code de Farinel, le plan du moulin à réparer est dans la bibliothèque des plans (sans cadenas)')
    if not SECOURS:
        ev(S, 'ouvrir-page', {'id': 'bibliotheque'}); S.wait_for_timeout(200); fermer(S)
        donner(S, 'info:passage', 'pisteur')
        # le jour, même avec le plan : pas de pièce cachée, un message clair (Romain, 23 h 48)
        explorer(P, 'moulin', ['cour'], photo=('cour', 'moulin-jour-plan'))
        verifier(P.evaluate("() => M.pointsVisibles('moulin', 'pisteur').map(function(x){ return x.id; }).join(',')") == 'cour' and 'ouvrir le passage sans être vu' in P.evaluate("() => M.pointsVisibles('moulin', 'pisteur')[0].t"), 'Pisteur (après-midi, avec le plan) : au moulin, « Impossible d\'ouvrir le passage sans être vu… Mieux vaut revenir la nuit. »')
    # Gaspard puis Margot (visites libres) : la pièce d'or, les signes (le rassemblement n'est plus au Barde : Romain, 22 h 41)
    parler(B, 'gaspard', [(0, None), (1, None), (2, None)]); fermer(B)
    donner(B, 'obj:piece_pain', 'alchimiste')   # (11 novembre : Gaspard donne la pièce de Bastien ; l'Alchimiste la comparera)
    ev(A, 'analyser', {'id': 'piece_pain'}); A.wait_for_timeout(200)
    m = modal(A) or {}
    verifier('fêlure' in m.get('t', '') and 'farine' in m.get('t', '') and not m.get('code') and 'jumelle' not in m.get('t', ''), f'Alchimiste : la pièce de la boulangerie seule (fêlure, farine), pas encore de code ({m.get("t", "")[:60]})')
    fermer(A)
    verifier(B.evaluate("() => !!M.barde.mimiques().margot") and not any(q.get('rassemble') for q in B.evaluate("() => M.E().pnj.gaspard.questions.concat(M.E().pnj.margot.questions)")), 'Barde : Gaspard révèle le signe de Margot ; plus de question de rassemblement')
    parler(B, 'margot', [(0, None)]); demasquer(B, 'margot', 0)
    for i in (1, 2): ev(B, 'question', {'p': 'margot', 'i': str(i)})
    verifier(B.evaluate("() => ['victor','tim','bastien','melusine','fortune','farinel'].every(function(id){ return !!M.barde.mimiques()[id]; })"), 'Barde : Margot révèle les signes des six autres menteurs')
    B.wait_for_timeout(2600)
    verifier(B.locator('#voile details.bd-boite:not([open])').count() >= 2 and B.locator('#voile details.bd-boite[open]').count() == 1, 'Barde : les réponses déjà dites sont des boîtes refermées, une seule ouverte')
    verifier(B.locator('#voile .bd-signes').count() == 0, 'Barde : plus de bloc « Les 7 signes du menteur »')
    verifier(B.evaluate("() => document.getElementById('bd-visage').getBoundingClientRect().width") >= 300, 'Barde : le grand portrait (au moins 300 px sur un téléphone)')
    shot(B, 'interrogatoire-margot')
    # rouvrir une boîte déjà dite (un toucher sur sa question) : elle s'ouvre, l'autre se ferme
    B.locator('#voile details.bd-boite:not([open]) > summary').first.click(); B.wait_for_timeout(200)
    verifier(B.locator('#voile details.bd-boite[open]').count() == 1, 'Barde : toucher une autre question l\'ouvre et referme la précédente')
    shot(B, 'boite-rouverte')
    fermer(B)
    parler(B, 'tim', [(0, None), (1, 'bon')]); demasquer(B, 'tim', 1)
    verifier((modal(B) or {}).get('code') == 'obj:pierre', 'Barde : Tim avoue et donne la pierre gravée')
    fermer(B); donner(B, 'obj:pierre', 'sage')
    ev(S, 'ouvrir-page', {'id': 'pierre'}); S.wait_for_timeout(200); fermer(S)
    # Victor : la potion de vérité, offerte AVANT les questions ; il dit son mensonge… et se reprend tout de suite
    ev(B, 'parler', {'id': 'victor'}); B.wait_for_timeout(300)
    verifier(B.locator('#voile .bd-potion-btn.b-aller[data-act=bd-potion]').count() == 1, 'Barde : « Lui offrir la potion de vérité » (bouton jaune), avant les questions')
    ev(B, 'bd-potion', {'p': 'victor'}); B.wait_for_timeout(300)
    verifier(mode_bd(B) == 'potion' and 'merci beaucoup' in B.evaluate("() => M.UI.bd.t") and B.evaluate("() => M.P().potionBue === 'victor' && !(M.P().potions.verite > 0)"), 'Barde : Victor accepte (« Oh, c\'est pour moi ? … merci beaucoup ! »), la potion est bue')
    B.wait_for_timeout(1800); shot(B, 'potion-offerte')
    ev(B, 'question', {'p': 'victor', 'i': '0'}); B.wait_for_timeout(300)
    verifier(mode_bd(B) == 'potionrep' and B.evaluate("() => !!M.P().vus['verite:victor:0'] && !!M.P().vus['potion:victor:0']"), 'Barde : avec la potion, Victor dit tout de suite la vérité')
    B.wait_for_timeout(5200); shot(B, 'potion-verite-directe')
    # (Romain, 13 novembre : la potion donne la vérité directe, plus de mensonge suivi de « je me suis trompé »)
    verifier('potion de vérité' in B.inner_text('#voile .bd-boite[open]') and 'je me suis trompé' not in B.inner_text('#voile .bd-boite[open]') and 'La vérité' in B.inner_text('#voile .bd-boite[open]'), 'Barde : la vérité directe, marquée « Mensonge (potion de vérité) »')
    fermer(B)
    ev(B, 'parler', {'id': 'victor'})
    verifier(mode_bd(B) == 'encore', 'Barde : Victor, revu sans rien de nouveau → « Encore toi ? »')
    fermer(B)
    # Bastien : le premier mensonge (la capture de l'interrogatoire)
    parler(B, 'bastien', [(0, None)]); B.wait_for_timeout(1600)
    verifier(B.locator('#voile [data-act=bd-ment]').count() >= 1, 'Barde : le bouton 🤥 pendant que Bastien ment')
    shot(B, 'interrogatoire-bastien')
    demasquer(B, 'bastien', 0); B.wait_for_timeout(900); shot(B, 'bastien-promenade')
    fermer(B)
    ev(B, 'parler', {'id': 'bastien'})
    verifier(mode_bd(B) == 'encore', 'Barde : Bastien ne veut pas être vu deux fois dans le même moment')
    fermer(B)
    # (Romain, 5 novembre, 21 h 46) le 🤥 seulement sous la dernière réponse : on démasque tout de suite, avant la question suivante
    parler(B, 'fortune', [(0, None)]); demasquer(B, 'fortune', 0)
    # (7 novembre : plus de question 2, l'indice leurre sur Victor, retiré)
    ev(B, 'question', {'p': 'fortune', 'i': '1'}); B.wait_for_timeout(60)
    verifier(B.evaluate("() => M.barde.derniere('fortune') === 1 && M.E().pnj.fortune.questions.length === 2") and B.locator('#voile .bd-ment-p[data-act=bd-ment][data-i="0"]').count() == 0, 'Barde : le 🤥 n\'est plus que sous la dernière réponse de Fortuné')
    fermer(B)
    parler(B, 'iris', [(1, 'bon'), (2, None)]); fermer(B)   # l'après-midi, Iris reparle (l'indice de Mélusine : un compliment sur ses fleurs)
    passer(2)

    # ================= NUIT =================
    print('— nuit')
    # le rassemblement (Romain, 5 novembre, 01 h 36) : à la nuit, le Grand Livre du Sage s'est ouvert tout seul sur « Rassembler le village »,
    # avec le gros bouton jaune, même sans aucune preuve ; il y revient quand il rouvre son livre, sans jamais l'y bloquer
    verifier(S.evaluate("() => M.livrePage()") == 'rassemblement' and S.evaluate("() => M.P().onglet") == 'role', f'Sage : passé à la nuit, le Grand Livre s\'ouvre sur « Rassembler le village » ({S.evaluate("() => M.livrePage()")})')
    S.evaluate("() => { var P = M.P(); window.__pr = {}; ['info:canne', 'info:rochers', 'info:odette', 'obj:pierre', 'info:tim_chene'].forEach(function(c){ window.__pr[c] = P.recus[c]; delete P.recus[c]; }); M.UI.modal = null; M.render(); }"); S.wait_for_timeout(300)
    bt = S.locator('#livre-ici .lv-page.on [data-act=ouvrir-page][data-id=rassemblement]')
    t = S.inner_text('#livre-ici .lv-page.on')
    verifier(bt.count() == 1 and 'b-aller' in (bt.get_attribute('class') or '') and '📣 Rassembler le village' in bt.inner_text() and 'preuve' not in t, 'Sage (nuit) : sans aucune preuve, le gros bouton jaune « 📣 Rassembler le village »')
    shot(S, 'sage-rassemblement-sans-preuves')
    S.evaluate("() => { M.livreAller('codes', true); M.render(); }"); S.wait_for_timeout(200)
    verifier(S.evaluate("() => M.livrePage()") == 'codes', 'Sage (nuit) : il peut tourner les pages (le livre ne le bloque pas sur le rassemblement)')
    ev(S, 'onglet', {'o': 'carnet'}); ev(S, 'onglet', {'o': 'role'}); S.wait_for_timeout(300)
    verifier(S.evaluate("() => M.livrePage()") == 'rassemblement', 'Sage (nuit) : il rouvre son livre → retour sur « Rassembler le village » (pas encore fait)')
    S.evaluate("() => { var P = M.P(); Object.keys(window.__pr).forEach(function(c){ if(window.__pr[c]) P.recus[c] = window.__pr[c]; }); M.sauver(); M.render(); }"); S.wait_for_timeout(300)
    shot(S, 'sage-rassemblement-bouton')
    ev(S, 'ouvrir-page', {'id': 'rassemblement'}); S.wait_for_timeout(300)
    verifier((modal(S) or {}).get('code') == 'info:rassemblement' and S.locator('#voile .rs-scene').count() == 1, 'Sage : la scène du rassemblement, puis le code du récit')
    S.wait_for_timeout(4200); shot(S, 'sage-rassemblement-scene')
    fermer(S)
    for r in ['pisteur', 'alchimiste', 'barde']: entrer(J[r], 'info:rassemblement', S)
    # après le rassemblement, la table d'analyse dit ce qu'était la fumée rouge : un fumigène (le même code, le texte suit l'enquête)
    t = A.evaluate("() => (M.analysesAtelier().filter(function(x){ return x.id === 'poudre'; })[0] || {}).t || ''")
    verifier('fumigène' in t and 'vapeurs toxiques' in t, 'Alchimiste (après le rassemblement) : la poudre du pot, c\'est un fumigène, pas des vapeurs toxiques')
    if SECOURS:
        ev(P, 'lieu', {'id': 'moulin'}); ev(P, 'explorer', {'id': 'moulin'})
        verifier(P.evaluate("() => M.pointsVisibles('moulin', 'pisteur').map(function(x){ return x.id; }).join(',')") == 'guet', 'Pisteur (secours) : sans le plan, la nuit au moulin, seulement « Te cacher et guetter »')
        fermer(P)
        # sans le plan (Romain, 5 novembre, 00 h 27) : guetter → l'homme en cape sort, la porte se referme et se fond dans le mur ;
        # un seul choix, le suivre (plus de « 🚪 Entrer par la porte mal fermée ») ; jamais la pièce cachée sans le plan
        ev(P, 'lieu', {'id': 'moulin'}); ev(P, 'point', {'l': 'moulin', 'id': 'guet'}); P.wait_for_timeout(200)
        t = P.inner_text('#voile')
        verifier(P.locator('#voile .b-choix-point [data-id=alambics]').count() == 0 and P.locator('#voile .b-choix-point [data-id=suivre]').count() == 1 and 'impossible de voir comment elle s\'ouvre' in t and 'Que fais-tu' not in t,
          'Pisteur (secours) : guetter réussi sans le plan → la porte se fond dans le mur, un seul choix : « Suivre l\'homme en cape »')
        shot(P, 'guet-sans-plan'); fermer(P)
        verifier(P.evaluate("() => M.pointsVisibles('moulin', 'pisteur').map(function(x){ return x.id; }).join(',')") == 'guet,suivre', 'Pisteur (secours) : sans le plan, ni « La pièce cachée » ni « Sous l\'alambic »')
        # le suivre, raté (item 6, Romain, minuit) : une direction quand même, et rien d'autre
        P.evaluate("() => { window.__rate = ['traces']; }")
        ev(P, 'point', {'l': 'moulin', 'id': 'suivre'}); P.wait_for_timeout(200)
        verifier('Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher.' in (modal(P) or {}).get('t', '') and not (modal(P) or {}).get('code'), 'Pisteur (secours) : l\'homme en cape perdu, « mais il partait vers le sud-ouest, du côté du clocher », sans code')
        shot(P, 'suivre-rate'); P.evaluate("() => { window.__rate = []; }"); fermer(P)
        # le plan du Sage n'arrive que maintenant, dans la nuit : en revenant au moulin, « La pièce cachée » est là (le guet garde son texte)
        ev(S, 'ouvrir-page', {'id': 'bibliotheque'}); S.wait_for_timeout(200); fermer(S)
        donner(S, 'info:passage', 'pisteur')
        ev(P, 'lieu', {'id': 'moulin'}); P.wait_for_timeout(200)
        verifier(P.locator('#voile [data-act=point][data-id=alambics]:not([disabled])').count() == 1 and P.evaluate("() => M.P().vus['pisteur:moulin:guet'] === 'ok' && M.pointsVisibles('moulin', 'pisteur')[0].t.indexOf('impossible de voir') >= 0"),
          'Pisteur (secours) : le plan reçu plus tard dans la nuit, de retour au moulin, « La pièce cachée » se touche (guetter reste vu, avec son texte)')
        shot(P, 'moulin-plan-tardif')
        P.click('#voile [data-act=point][data-id=alambics]'); P.wait_for_timeout(300)
        verifier(P.evaluate("() => M.P().vus['pisteur:moulin:alambics'] === 'ok'"), 'Pisteur (secours) : la pièce cachée, avec le plan')
        shot(P, 'piece-cachee')
        P.click('#voile .b-feuille-decouverte [data-act=lieu]'); P.wait_for_timeout(300)   # « D'accord » : retour au moulin, dans la même visite
        verifier(P.locator('#voile [data-act=point][data-id=piece]:not([disabled])').count() == 1, 'Pisteur (secours) : entré dans la pièce cachée, « Sous l\'alambic » apparaît tout de suite (même visite)')
        P.click('#voile [data-act=point][data-id=piece]'); P.wait_for_timeout(300)
        verifier(P.evaluate("() => M.P().vus['pisteur:moulin:piece'] === 'ok'"), 'Pisteur (secours) : sous l\'alambic, la pièce d\'or')
        fermer(P)
    else:
        # avec le plan du Sage : la pièce cachée tout de suite (guetter reste possible) ; « Sous l'alambic » une fois entré (Romain, 23 h 31)
        ev(P, 'lieu', {'id': 'moulin'}); ev(P, 'explorer', {'id': 'moulin'})
        verifier(P.evaluate("() => M.pointsVisibles('moulin', 'pisteur').map(function(x){ return x.id; }).join(',')") == 'guet,alambics', 'Pisteur (nuit, avec le plan) : « Te cacher et guetter » et « La pièce cachée », pas encore « Sous l\'alambic »')
        shot(P, 'moulin-nuit-points')
        # (Romain, 23 h 58) guetter → l'homme en cape noire sort (visage caché) → « 👣 Suivre l'homme en cape » (niveau 10) → la crypte du clocher
        ev(P, 'point', {'l': 'moulin', 'id': 'guet'}); P.wait_for_timeout(200)
        t = P.inner_text('#voile')
        verifier('cape noire' in t and 'Bastien' not in t and 'passage secret du plan du Sage' in t and P.locator('#voile .b-choix-point .b-aller').count() == 1 and P.locator('#voile .b-choix-point [data-id=suivre]').count() == 1,
          'Pisteur : guetter réussi (avec le plan) → l\'homme en cape noire (visage caché) sort par le passage du plan, et un seul choix « 👣 Suivre l\'homme en cape »')
        shot(P, 'moulin-guet-choix')
        verifier(P.evaluate("() => M.texteEchec(M.pointsVisibles('moulin', 'pisteur').filter(function(x){ return x.id === 'suivre'; })[0], 1)").startswith('Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher.'), 'Pisteur : si le suivre rate, « Tu as perdu sa trace… mais il partait vers le sud-ouest, du côté du clocher. »')
        P.click('#voile .b-choix-point [data-id=suivre]'); P.wait_for_timeout(300)
        verifier((modal(P) or {}).get('type') == 'avant-mj' and 'très difficile' in (modal(P) or {}).get('t', '') and P.locator('#voile .b-avant-mj [data-act=mj-go]').count() == 1, 'Pisteur : « Suivre l\'homme en cape », l\'explication (très difficile) puis le bouton jaune')
        shot(P, 'avant-suivre')
        P.evaluate("() => { window.__niv = []; }")
        P.click('#voile .b-avant-mj [data-act=mj-go]'); P.wait_for_timeout(400)
        niv = P.evaluate("() => window.__niv")
        t = P.inner_text('#voile')
        verifier(niv and niv[-1][0] == 'traces' and niv[-1][1] >= 9, f'Pisteur : suivre l\'homme en cape, « Suivre la piste » au niveau 10 (niveau effectif {niv and niv[-1][1]})')
        verifier(not (modal(P) or {}).get('code') and 'crypte' in t and 'farine' not in t and P.evaluate("() => M.sousSolsDecouverts().indexOf('q_crypte') >= 0"), 'Pisteur : suivi jusqu\'à la crypte du clocher (fermée à clé, rien sur sa cape) → plus de code (à l\'oral), sur son tableau des chemins secrets')
        shot(P, 'suivi-crypte'); fermer(P)
        explorer(P, 'moulin', ['alambics'], photo=('alambics', 'piece-cachee'))
        verifier('piece' in P.evaluate("() => M.pointsVisibles('moulin', 'pisteur').map(function(x){ return x.id; })"), 'Pisteur : entré dans la pièce cachée, « Sous l\'alambic » apparaît')
        explorer(P, 'moulin', ['piece'], photo=('piece', 'sous-alambic'))
    donner(P, 'obj:colorant', 'alchimiste')
    donner(P, 'obj:piece_moulin', 'alchimiste')   # (11 novembre : la pièce d'or va à l'Alchimiste)
    ev(P, 'lieu', {'id': 'chene'}); ev(P, 'explorer', {'id': 'chene'})
    pot = P.evaluate("() => (M.pointsVisibles('chene', 'pisteur').filter(function(x){ return x.id === 'pot'; })[0] || {}).t || ''")
    verifier('fumée rouge' in pot and 'noirci' in pot, 'Pisteur : la nuit, après le rassemblement, le pot est tout noirci (texte qui change)')
    fermer(P)
    ev(A, 'analyser', {'id': 'colorant'}); A.wait_for_timeout(200); fermer(A)
    verifier(A.evaluate("() => !!M.P().analyses.colorant"), 'Alchimiste : le colorant est le même rouge que la rivière')
    # les deux pièces comparées : jumelles → le code pour le Barde (sans lui, Bastien ne peut pas être confronté)
    verifier(not B.evaluate("() => M.besoinOk(M.E().pnj.bastien.questions[1].besoin)"), 'Barde : sans la comparaison des pièces, pas de question de la pièce chez Bastien')
    ev(A, 'analyser', {'id': 'piece_moulin'}); A.wait_for_timeout(200)
    m = modal(A) or {}
    verifier('même petite fêlure' in m.get('t', '') and m.get('code') == 'info:piece', f'Alchimiste : la deuxième pièce, comparée à la première : jumelles, un code pour le Barde ({m.get("code")})')
    shot(A, 'pieces-jumelles'); fermer(A)
    donner(A, 'info:piece', 'barde')
    # Barde : les ouvriers au lavoir (phrase à trous), puis Bastien chez lui avec la pièce
    # (Romain, 5 novembre, 14 h 15 : plus de phrase à trous ; les mots des ouvriers tout de suite, et notés)
    ev(B, 'ecouter', {'id': 'ouvriers'})
    verifier('bouché' in ((modal(B) or {}).get('t') or '') and not (B.evaluate("() => M.P().trous") or {}).get('ecoute:ouvriers'), 'Barde : les ouvriers au lavoir, leurs mots tout de suite (plus de phrase à trous)')
    fermer(B)
    # (11 novembre : plus de « Quoi de neuf, ce soir ? » chez Margot, doublon de la pièce ; Gaspard vexé la nuit la lâche quand même)
    verifier(B.evaluate("() => M.E().pnj.margot.questions.length") == 3 and B.evaluate("() => M.E().pnj.gaspard.vexeDonne.obj") == 'piece_pain', 'Barde (nuit) : plus de doublon de la pièce chez Margot ; Gaspard vexé donne quand même la pièce')
    parler(B, 'bastien', [(1, None)], maison='B2')
    if TALENT == 'exiger':
        ev(B, 'bd-exiger', {'p': 'bastien'})
        verifier(B.evaluate("() => !!M.P().vus['verite:bastien:1']"), 'Barde : « J\'exige la vérité » fait avouer Bastien')
    else:
        demasquer(B, 'bastien', 1)
    B.wait_for_timeout(1200); shot(B, 'bastien-aveu')
    fermer(B)
    # le filet de Tim (Romain, 23 h 20) : vexé la nuit, il lâche quand même sa pierre (on fait comme s'il ne l'avait pas encore donnée)
    B.evaluate("() => { delete M.P().objets.pierre; M.sauver(); }")
    parler(B, 'tim', [(0, None)], maison='L7'); ev(B, 'bd-ment', {'p': 'tim', 'i': '0'}); B.wait_for_timeout(300)
    m = modal(B) or {}
    verifier(m.get('code') == 'obj:pierre' and 'caillou' in m.get('t', '') and B.evaluate("() => M.P().vexe.tim === M.P().moment && !!M.P().objets.pierre"), 'Barde (nuit) : Tim, accusé à tort, part fâché… mais lâche sa pierre (le code est donné)')
    shot(B, 'tim-vexe-pierre'); fermer(B)
    # Sage : l'accusation, la nuit, tout de suite (plus de verrou ni de petit matin, Romain, 5 novembre, 01 h 36)
    S.evaluate("() => { M.P().onglet = 'role'; M.render(); if(M.livreAller) M.livreAller('accusation', true); }"); S.wait_for_timeout(300)
    verifier(S.evaluate("() => M.livrePage()") == 'accusation' and S.locator('#livre-ici [data-act=petit-matin]').count() == 0 and not S.evaluate("() => !!M.verrouAccusation || !!M.E().verrouAccusation"), 'Sage (nuit) : la page de l\'accusation (le rassemblement fait, le livre ne revient plus dessus), sans verrou ni petit matin')
    shot(S, 'accusation-nuit')
    ev(S, 'accuser'); ev(S, 'acc-choix', {'k': 'qui', 'v': 'bastien'}); ev(S, 'acc-choix', {'k': 'ou', 'v': 'moulin'})
    shot(S, 'accusation-pourquoi')
    ev(S, 'acc-choix', {'k': 'pourquoi', 'v': 'paye'})
    verifier((modal(S) or {}).get('type') == 'accusation', 'Sage : l\'écran de confirmation QUI / OÙ / POURQUOI')
    ev(S, 'acc-valider'); S.wait_for_timeout(300)
    verifier((modal(S) or {}).get('type') == 'victoire', 'Sage : la bonne accusation gagne')
    ev(S, 'fin-sage', {'n': '0'})
    for r in ROLES[:3]: entrer(J[r], 'victoire:0', S)
    for r in ROLES:
        for _ in range(10):
            if J[r].evaluate("() => M.P() && M.P().fin && M.P().fin.etape === 'histoire'"): ev(J[r], 'fin-suite')
        verifier(J[r].evaluate("() => M.P().fin.etape === 'recompenses'"), f'{r} : la fin, puis les récompenses')
    # (14 novembre, Bible §13.39 : l'enquête 3 est OUVERTE AUX JOUEURS.) Le robot joue sans « test » dans l'adresse, comme les joueurs :
    # à la fin de l'enquête 2, chacun a le bouton « 🔍 Enquête 3 » ; il mène à la lettre d'Odette, aux missions du maire, puis à l'enquête.
    verifier('en cours d\'écriture' not in S.inner_text('#app') and S.locator('[data-act=suite-sage]').count() == 1 and 'Enquête 3' in S.locator('[data-act=suite-sage]').inner_text(), 'Sage : à la fin de l\'enquête 2, le bouton « Enquête 3 » (plus de « en cours d\'écriture »)')
    S.evaluate("() => window.scrollTo(0, document.body.scrollHeight)"); shot(S, 'fin-enquete3')
    # une tablette repasse par le village (le Pisteur) : le bouton de l'enquête 3 y est aussi ; les trois autres partent de l'écran de fin
    V = J['pisteur']
    ev(V, 'fin-retour'); V.wait_for_timeout(200)
    verifier('en cours d\'écriture' not in V.inner_text('#app') and V.locator('[data-act=nouvelle-enquete]').count() == 1 and 'Enquête 3' in V.locator('[data-act=nouvelle-enquete]').inner_text(), 'Village (Pisteur) : le bouton « Enquête 3 » (plus de « en cours d\'écriture »)')
    shot(V, 'village-enquete3')
    V.click('[data-act=nouvelle-enquete]', force=True); V.wait_for_timeout(300)
    for r in ROLES[1:]:
        J[r].click('[data-act=suite-sage]', force=True); J[r].wait_for_timeout(300)
    for r in ROLES:
        pg = J[r]
        verifier(pg.evaluate("() => !/test/.test(location.search + location.hash) && !!M.P() && M.P().id === 3 && M.P().etape === 'lettre'"), f'{r} : en route pour l\'enquête 3, sans « test » dans l\'adresse (la lettre d\'Odette)')
        if r == 'sage': shot(pg, 'enquete3-lettre')
        pg.click('[data-act=lettre-suite]', force=True); pg.wait_for_timeout(200)
        pg.click('[data-act=commencer]', force=True); pg.wait_for_timeout(400)
        verifier(pg.evaluate("() => M.P().id === 3 && M.P().etape === 'jeu'") and len(pg.inner_text('#app').strip()) > 20, f'{r} : l\'enquête 3 a commencé')
    shot(J['barde'], 'enquete3-debut')
    print('Mini-jeux lancés :', {r: J[r].evaluate('() => window.__mj || []') for r in ROLES})
    print('Captures :', OUT)
    print('ÉCHECS :', echecs)
    print('ERREURS :', erreurs)
    b.close()
