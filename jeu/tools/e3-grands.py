"""Enquête 3 : les grands dialogues du Barde et la fête (Playwright). Refait le 12 novembre au soir (les dialogues de la version 3,
E3-dialogues-et-trame.md) : un grand dialogue ne s'ouvre qu'une fois TOUT demandé ({toutDit}, barde.js), il ne s'affiche pas comme les
autres (violet, « 🎭 Grande conversation », un reflet, sa fenêtre à bandeau), et « 🎭 » se pose sur le visage du villageois.
Le 13 novembre au soir (Bible §13.33 et §13.35) : « Retenir le maire » et la scène de Léo sont retirés ; à la place, quand le Pisteur
entre dans la dernière salle (le code « L'homme en cape est là ! »), Farinel et Iris portent un « ❗ » à la fête et répondent à de
nouvelles questions (les outils de Léo, la potion de force), qui restent à l'écran avec leur 🔊.
Sur la tablette du Barde (le marché du matin est sauté : le robot rend 10 bouquets au maire) :
  A : tout réussi — le maire n'ouvre pas tant qu'il reste une question ; la lettre prêtée ; la nuit, Anselme n'ouvre qu'avec l'aveu de
      Mélusine, le code « La crypte est fermée » et toutes ses questions ; les quatre choix en majuscules ; la fête (les indices notés),
      les trois écoutes de la fête, puis l'aide pour le donjon (Farinel : quatre questions ; Iris : deux) et la mission cochée ;
  B : tout raté — le piège de la copie, puis une partie où le maire refuse ; la nuit, Anselme raté (Tim montre le puits), Mélusine qui
      craque à la fête (le filet), le maire à la fête (une réplique, plus de petit dialogue).
   BRUMEVAL_DIST=<dossier construit> python3 tools/e3-grands.py [iphone]"""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
VUE = {'width': 390, 'height': 844} if 'iphone' in sys.argv else {'width': 1180, 'height': 820}
OUT = os.path.join(ICI, '..', 'test', 'e3-grands' + ('-iphone' if 'iphone' in sys.argv else ''))
os.makedirs(OUT, exist_ok=True)
erreurs, echecs = [], []
n = [0]

def shot(pg, nom):
    n[0] += 1; pg.wait_for_timeout(500); pg.screenshot(path=f'{OUT}/{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi)
    if not cond: echecs.append(quoi)

def ev(pg, act, data=None):
    pg.evaluate(f"() => {{ M.A['{act}']({{dataset:{json.dumps(data or {})}, closest:function(){{ return null; }}}}); }}"); pg.wait_for_timeout(150)

def modal(pg):
    return pg.evaluate("() => M.UI.modal ? JSON.parse(JSON.stringify(M.UI.modal)) : null")

def texte(pg, sel='#voile'):
    # (la réplique qui s'écrit lettre après lettre : son texte entier est dans data-t)
    return pg.evaluate(f"() => {{ var e = document.querySelector('{sel}'), g = document.querySelector('#gd-texte'); return e ? (e.innerText + ' ' + (g ? g.getAttribute('data-t') : '')).replace(/\\s+/g, ' ') : ''; }}")

def fermer(pg):
    pg.evaluate("() => { M.UI.modal = null; M.render(); }"); pg.wait_for_timeout(120)

def code(pg, cle):
    seq = pg.evaluate(f"() => M.code('{cle}')")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'code'; M.render(); }"); pg.wait_for_timeout(150)
    for s in seq: ev(pg, 'sym', {'s': s})
    pg.wait_for_timeout(400)

def apres_code(pg):
    fermer(pg); pg.evaluate("() => { M.P().onglet = 'carte'; M.render(); }")

def choisir(pg, k, act='gd-choix'):
    """Un vrai clic sur la réponse k (un bouton de la fenêtre)."""
    b = pg.locator(f'#voile [data-act={act}][data-k="{k}"]')
    verifier(b.count() == 1, f'la réponse {k} est à l\'écran')
    if b.count(): b.click(); pg.wait_for_timeout(250)

def objets(pg):
    return pg.evaluate("() => Object.keys(M.P().objets).filter(function(k){ return k.charAt(0) === '_'; })")

def debut(b, nom):
    pg = b.new_context(viewport=VUE).new_page()
    pg.set_default_timeout(8000)
    pg.on('console', lambda m: erreurs.append(f'[{nom}] {m.text}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{nom}] PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=barde]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Barde'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.evaluate("() => { M.S.talents = ['tendre']; M.sauver(); M.render(); }")
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
    pg.evaluate("""() => { M.lire = function(){}; M.lireAuto = function(){};
      M.A['ma-debut'](); var s = M.P().marche; s.f.fini = true; s.f.ouvert = true; s.b = 10; s.or = 0; M.UI.modal = null; M.sauver(); M.render(); }""")
    return pg

def apresmidi_maire(pg):
    code(pg, 'moment:1'); apres_code(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'apresmidi', 'l\'après-midi')
    ev(pg, 'parler', {'id': 'grosbec'})
    verifier((modal(pg) or {}).get('qui') == 'retour', 'le maire compte les bouquets')
    ev(pg, 'ma-rendu')
    verifier((modal(pg) or {}).get('type') == 'conv', 'puis on lui parle')


def tout_demander(pg, ids):
    """Pose à ces villageois toutes les questions qu'on voit en ce moment (pas les grands dialogues)."""
    pg.evaluate("""(ids) => { ids.forEach(function(id){ (M.E().pnj[id].questions || []).forEach(function(q, i){
        if(q.grand || M.barde.cachee(id, q)) return;
        M.A.question({dataset:{p:id, i:String(i)}, closest:function(){ return null; }}); M.UI.modal = null; }); }); M.sauver(); M.render(); }""", ids)
    pg.wait_for_timeout(200)

def grands_de(pg, pnj):
    return pg.evaluate("(p) => M.E().pnj[p].questions.map(function(q){ return q.grand || ''; })", pnj)

def bulle(pg, pnj):
    return pg.evaluate("(p) => M.pnjBulleCarte(p)", pnj)

MATIN_ET_APREM = ['margot', 'tim', 'fortune']   # ceux qu'on peut encore voir l'après-midi : ils comptent pour ouvrir le maire

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------------- Partie A : tout réussi ----------------
    print('— Partie A : la lettre ne s\'ouvre qu\'une fois tout demandé')
    pg = debut(b, 'A')
    verifier('gm' not in pg.evaluate("() => Object.keys(M.E().grands)") and all(not pg.evaluate("(g) => !!M.E().grands[g].toujours", g) for g in ('lettre', 'cle')), 'plus de grand dialogue de la Grosse Marie, plus de phrase « jusqu\'à minuit »')
    apresmidi_maire(pg)
    verifier(pg.locator('#voile .gd-q').count() == 0 and pg.locator('#voile [data-act=question]').count() == 4, 'le maire : ses 4 questions, pas encore le grand dialogue')
    tout_demander(pg, ['grosbec'])
    ev(pg, 'parler', {'id': 'grosbec'})
    verifier(pg.locator('#voile .gd-q').count() == 0, 'tout demandé au maire, mais pas à Margot, Tim et Fortuné : toujours fermé')
    verifier(bulle(pg, 'grosbec') != '🎭', 'pas de « 🎭 » sur la carte')
    shot(pg, 'A-maire-ferme')
    verifier(pg.evaluate("() => M.toutDit(['levoisin', 'gaspard', 'victor', 'iris'])"), 'ceux du matin, occupés l\'après-midi, ne bloquent pas (un oubli du matin ne ferme pas le dialogue)')
    tout_demander(pg, MATIN_ET_APREM[:2])
    verifier(not pg.evaluate("() => M.toutDit(['margot', 'tim', 'fortune', 'grosbec'])"), 'il manque encore Fortuné')
    tout_demander(pg, MATIN_ET_APREM[2:])
    fermer(pg)
    verifier(bulle(pg, 'grosbec') == '🎭', 'tout demandé : « 🎭 » sur le visage du maire')
    ev(pg, 'lieu', {'id': 'mairie'})
    verifier(pg.locator('#voile [data-act=parler][data-id=grosbec]').count() == 1, 'et on peut de nouveau lui parler')
    ev(pg, 'parler', {'id': 'grosbec'})
    verifier(pg.locator('#voile .gd-q.gd-neuve').count() == 1 and 'GRANDE CONVERSATION' in texte(pg).upper(), 'la question « Je voudrais vous parler de la lettre… », avec son étiquette')
    shot(pg, 'A-maire-questions')
    pg.locator('#voile .gd-q').click(); pg.wait_for_timeout(700)
    m = modal(pg)
    verifier(m and m['type'] == 'grand' and m['g'] == 'lettre', 'la fenêtre du grand dialogue s\'ouvre')
    verifier(pg.locator('#voile .b-feuille.gd-fenetre .gd-bandeau').count() == 1 and pg.locator('#voile .gd-pas i').count() == 3 and pg.locator('#voile .gd-pas i.ici').count() == 1, 'son cadre, son bandeau, trois ronds (un par étape)')
    verifier(pg.locator('#voile .ma-ligne').count() == 4 and pg.locator('#voile .ma-ligne .b-lire').count() == 4, 'étape 1 : 4 réponses, chacune avec son 🔊')
    verifier(pg.locator('#voile .ma-dit .b-lire').count() >= 1, 'la réplique du maire a son 🔊')
    pg.wait_for_timeout(2600); shot(pg, 'A-lettre-1')
    choisir(pg, 1)
    verifier('Que puis-je pour vous' in texte(pg) and pg.locator('#voile .gd-pas i.fait').count() == 1, 'bonne réponse (sa fête) : étape 2, un rond plein')
    choisir(pg, 2)
    verifier('vous me la rendez quand' in texte(pg), 'étape 3 (« on dit que vous la cachez… »)')
    pg.wait_for_timeout(2600); shot(pg, 'A-lettre-3')
    choisir(pg, 3)
    verifier('Avant ce soir' in texte(pg) and 'minuit' not in texte(pg), 'sa dernière réplique ; plus de « jusqu\'à minuit »')
    verifier(pg.evaluate("() => !!M.P().objets.lettre && M.P().vus['grand:lettre']") == 'ok', 'le code « La lettre d\'Odette » est donné')
    pg.wait_for_timeout(2500); shot(pg, 'A-lettre-fin')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(300)
    verifier((modal(pg) or {}).get('type') == 'decouverte' and pg.locator('#voile .b-donne').count() == 1, 'la découverte, avec le code à donner')
    shot(pg, 'A-lettre-code')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier((modal(pg) or {}).get('type') == 'conv' and 'prêté la lettre' in pg.evaluate("() => document.querySelector('#voile .gd-q').textContent"), 'retour à la conversation : la boîte dit ce qui s\'est passé')
    verifier(pg.locator('#voile .gd-q.gd-neuve').count() == 0 and bulle(pg, 'grosbec') != '🎭', 'fini : plus de reflet, plus de « 🎭 »')
    fermer(pg)

    print('— Partie A : la nuit, Anselme')
    code(pg, 'moment:2'); apres_code(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    verifier(pg.evaluate("() => M.pnjIci('clocher').indexOf('anselme') >= 0"), 'Anselme est au clocher')
    idx = grands_de(pg, 'anselme'); ic = idx.index('cle')
    ev(pg, 'parler', {'id': 'anselme'})
    verifier(pg.locator('#voile .gd-q').count() == 0, 'son grand dialogue ne se voit pas')
    tout_demander(pg, ['anselme']); ev(pg, 'parler', {'id': 'anselme'})
    verifier(pg.locator('#voile .gd-q').count() == 0, 'tout demandé à Anselme : il manque l\'aveu de Mélusine et la crypte')
    fermer(pg)
    ev(pg, 'gd-fete', {'id': 'melusine'})
    verifier('C\'est moi qui ai écrit la lettre' in texte(pg) and '_info:aveu' in objets(pg) and 'Léo' not in texte(pg), 'Mélusine craque à la fête (le filet) : un homme en cape, aucun nom')
    fermer(pg)
    ev(pg, 'parler', {'id': 'anselme'})
    verifier(pg.locator('#voile .gd-q').count() == 0, 'avec l\'aveu : il manque encore le code du Pisteur')
    fermer(pg)
    code(pg, 'info:crypte_fermee'); apres_code(pg)
    ev(pg, 'parler', {'id': 'anselme'})
    verifier('sous le clocher' in texte(pg) and pg.locator('#voile .gd-q').count() == 0, '« La crypte est fermée » : une question de plus chez Anselme, à poser d\'abord')
    tout_demander(pg, ['anselme']); fermer(pg)
    verifier(bulle(pg, 'anselme') == '🎭', 'tout est prêt : « 🎭 » sur Anselme')
    ev(pg, 'parler', {'id': 'anselme'})
    verifier(pg.locator('#voile .gd-q.gd-neuve').count() == 1 and 'je voudrais vous demander quelque chose' in texte(pg), 'son grand dialogue arrive')
    shot(pg, 'A-anselme-nuit')
    verifier(pg.evaluate("() => M.E().grands.cle.etapes.every(function(e){ return e.choix.every(function(c){ return c.q === c.q.toUpperCase(); }); })"), 'chez Anselme, les quatre choix de chaque étape sont en majuscules (la bonne réponse ne se voit plus)')
    ev(pg, 'question', {'p': 'anselme', 'i': str(ic)})
    pg.wait_for_timeout(2200); shot(pg, 'A-cle-1')
    choisir(pg, 2); choisir(pg, 0)
    verifier('Dis-moi pourquoi' in texte(pg), 'étape 3 (sans le presser ; « je peux vous aider ? »)')
    choisir(pg, 3)
    verifier('_info:cle_clou' in objets(pg) and 'on sonne pour Odette' in texte(pg), 'il monte sonner avec le Barde : le code pour le Pisteur')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(250)
    verifier('La Grosse Marie sonne' in texte(pg) and 'clé pend à sa ceinture' in texte(pg) and 'brume' not in texte(pg), '« La Grosse Marie sonne » : sa clé pend à sa ceinture')
    shot(pg, 'A-cle-code')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    fermer(pg)

    # (13 novembre, Bible §13.33 et §13.35) « Retenir le maire » est retiré ; à sa place : l'aide pour le donjon (Farinel et Iris)
    print('— Partie A : la fête')
    verifier(bulle(pg, 'grosbec') != '❗', 'le maire ne cherche plus le Barde (plus de « Retenir le maire »)')
    ev(pg, 'lieu', {'id': 'place'})
    t = texte(pg)
    verifier('la fête' in t.lower() and pg.locator('#voile [data-act=gd-fete]').count() >= 10, 'sur la place : la fête, chacun avec son bouton')
    verifier(pg.locator('#voile .gd-appel').count() == 0, 'personne ne porte de « ! » : le Pisteur n\'est pas encore devant l\'homme en cape')
    verifier(pg.locator('#voile [data-act=bd-porte]').count() == 1, '👂 Écouter en douce, à la fête')
    shot(pg, 'A-fete')
    for qui in ['grosbec', 'silas', 'margot', 'farinel', 'iris']:
        ev(pg, 'gd-fete', {'id': qui})
        verifier((modal(pg) or {}).get('vue') == 'fete' and not (modal(pg) or {}).get('aide') and pg.locator('#voile [data-act=gd-aide]').count() == 0, f'{qui} à la fête : sa réplique, rien de plus')
    verifier('repose mes yeux' in texte(pg) or 'couronne pour Odette' in texte(pg), 'Iris : « J\'ai tressé une couronne pour Odette… »')
    fermer(pg)
    # les trois écoutes de la fête
    vus = []
    for i in range(4):
        ev(pg, 'bd-porte', {'l': 'place'})
        vus.append(pg.evaluate("() => Object.keys(M.P().vus).filter(function(k){ return /^barde:oreille:.*_nuit$/.test(k); }).length"))
        fermer(pg)
    verifier(vus == [1, 2, 3, 3], 'les trois écoutes de la fête, l\'une après l\'autre')

    print('— Partie A : l\'aide pour le donjon (le code « L\'homme en cape est là ! »)')
    VISIBLES = "() => M.etapesMission().filter(function(e){ return (e.des === undefined || (M.P().moment || 0) >= e.des) && (!e.si || e.si.some(M.condMission)); }).map(function(x){ return x.t; }).join(' | ')"   # (comme pasEncore, mission.js)
    avant = pg.evaluate(VISIBLES)
    verifier('Tes amis se battent' not in avant, 'la mission de la fête n\'est pas encore dans le Carnet')
    code(pg, 'info:leo_la')
    verifier('homme en cape' in texte(pg) and pg.evaluate("() => !!M.P().recus['info:leo_la']"), 'le code du Pisteur : « L\'homme en cape est là ! »')
    apres_code(pg); fermer(pg)
    verifier('Tes amis se battent' in pg.evaluate(VISIBLES), 'la mission arrive : « Tes amis se battent, tout au fond ! À la fête, quelqu\'un saura peut-être les aider. »')
    ev(pg, 'lieu', {'id': 'place'})
    verifier(pg.locator('#voile .gd-fete-tete.gd-appel').count() == 2 and pg.locator('#voile .gd-fete-tete.gd-appel[data-id=farinel]').count() == 1 and pg.locator('#voile .gd-fete-tete.gd-appel[data-id=iris]').count() == 1, 'à la fête : Farinel et Iris portent un « ❗ » (on peut leur reparler)')
    shot(pg, 'A-fete-aide')
    ev(pg, 'gd-fete', {'id': 'farinel'})
    verifier((modal(pg) or {}).get('aide') and 'Qui a touché à mes outils' in texte(pg) and pg.locator('#voile [data-act=gd-aide]').count() == 4, 'Farinel : « Qui a touché à mes outils ?! », quatre questions')
    reps = ['vois des étoiles', 'saigne longtemps', 'perce même le cuir', 'flamme près de sa farine']
    for k in range(4):
        pg.locator('#voile [data-act=gd-aide]').first.click(); pg.wait_for_timeout(200)
        verifier(reps[k] in texte(pg) and pg.locator('#voile .gd-aide-rep').count() == k + 1 and pg.locator('#voile [data-act=gd-aide]').count() == 3 - k, f'sa réponse n° {k + 1} s\'affiche et reste (« … {reps[k]} … »)')
    mots = pg.evaluate("() => [].map.call(document.querySelectorAll('#voile .gd-aide-rep .ma-dit'), function(p){ return p.textContent.replace(/🔊/g, '').replace(/…/g, ',').trim().split(/[.!?]+/).filter(function(x){ return x.trim().length > 2; }).length; })")
    verifier(all(n <= 2 for n in mots), f'deux phrases au plus par réponse (la règle de lecture du Barde) {mots}')
    verifier(pg.locator('#voile .gd-aide-rep button').count() == 4, 'chaque réponse a son 🔊 (le Barde les lit à voix haute pendant le combat)')
    pg.wait_for_timeout(1500); shot(pg, 'A-farinel-aide')
    fermer(pg)
    verifier(pg.evaluate("() => !!M.P().vus['fete:aide:farinel']") and 'assomme' in pg.evaluate("() => JSON.stringify(M.S.calepin || []) + JSON.stringify(M.P().carnet || M.P().notes || '')"), 'tout demandé à Farinel : c\'est noté dans le Carnet')
    ev(pg, 'lieu', {'id': 'place'})
    verifier(pg.locator('#voile .gd-fete-tete.gd-appel').count() == 1 and pg.locator('#voile .gd-fete-tete[data-id=farinel]:not([disabled])').count() == 1, 'Farinel n\'a plus son « ❗ », mais on peut toujours retourner le voir (pour relire)')
    ev(pg, 'gd-fete', {'id': 'farinel'})
    verifier(pg.locator('#voile .gd-aide-rep').count() == 4, 'ses quatre réponses sont toujours là')
    fermer(pg)
    ev(pg, 'gd-fete', {'id': 'iris'})
    verifier('Il faut que je te dise' in texte(pg) and pg.locator('#voile [data-act=gd-aide]').count() == 2, 'Iris : deux questions')
    for k in range(2): pg.locator('#voile [data-act=gd-aide]').first.click(); pg.wait_for_timeout(200)
    verifier('potion de force' in texte(pg) and 'Sauf s\'il saigne' in texte(pg), 'Iris : sa potion de force volée — « Sauf s\'il saigne »')
    shot(pg, 'A-iris-aide')
    fermer(pg)
    faits = pg.evaluate("() => { M.render(); return (M.etapesMission() || []).filter(function(x){ return !x.libre && !x.piste; }).map(function(x){ return [x.t.slice(0, 22), !!(x.fait && x.fait.some(M.condMission))]; }); }")
    verifier(any(t.startswith('Tes amis se battent') and ok for t, ok in faits), f'la mission de la fête est cochée ({[t for t, ok in faits if not ok]} pas cochées)')
    pg.close()

    # ---------------- Partie B : tout raté ----------------
    print('— Partie B : le piège de la copie')
    pg = debut(b, 'B')
    tout_demander(pg, MATIN_ET_APREM)
    apresmidi_maire(pg)
    tout_demander(pg, ['grosbec']); ev(pg, 'parler', {'id': 'grosbec'})
    i = grands_de(pg, 'grosbec').index('lettre')
    ev(pg, 'question', {'p': 'grosbec', 'i': str(i)})
    choisir(pg, 1); choisir(pg, 2); choisir(pg, 2)
    verifier('recopiez donc' in texte(pg) and '_info:lettre_bureau' in objets(pg) and '_info:copie' not in objets(pg) and not pg.evaluate("() => !!M.P().objets.lettre"), 'le piège : une copie, pas la lettre ; le code « La lettre est sur le bureau du maire » pour le Pisteur (13 novembre)')
    shot(pg, 'B-copie')
    pg.close()
    print('— Partie B : le maire refuse')
    pg = debut(b, 'B2')
    tout_demander(pg, MATIN_ET_APREM)
    apresmidi_maire(pg)
    tout_demander(pg, ['grosbec']); ev(pg, 'parler', {'id': 'grosbec'})
    ev(pg, 'question', {'p': 'grosbec', 'i': str(i)})
    choisir(pg, 3)
    verifier('Revenez plus tard' in texte(pg) and 'minuit' not in texte(pg), 'mauvais choix : « Bien, bien… Revenez plus tard. »')
    # (13 novembre) raté : le Barde reçoit un code pour le Pisteur, qui ira chercher la lettre en cachette
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(300)
    verifier('_info:lettre_bureau' in objets(pg) and 'sans se faire voir' in texte(pg) and pg.locator('#voile .b-donne').count() == 1, 'raté : « La lettre est sur le bureau du maire », un code pour le Pisteur')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier('pas voulu te prêter' in pg.evaluate("() => document.querySelector('#voile .gd-q').textContent") and pg.evaluate("() => M.P().vus['grand:lettre']") == 'rate', 'un seul essai : le maire n\'a pas voulu prêter la lettre')
    verifier(pg.locator('#voile .gd-q.gd-neuve').count() == 0 and pg.locator('#voile [data-act=gd-reprendre]').count() == 0, 'pas de deuxième chance')
    shot(pg, 'B-maire-ferme')
    fermer(pg)
    print('— Partie B : la nuit')
    code(pg, 'moment:2'); apres_code(pg)
    ic = grands_de(pg, 'anselme').index('cle')
    ev(pg, 'gd-fete', {'id': 'melusine'})
    verifier('C\'est moi qui ai écrit la lettre' in texte(pg) and '_info:aveu' in objets(pg), 'le filet : Mélusine craque à la fête (code pour le Sage)')
    shot(pg, 'B-melusine-filet')
    fermer(pg)
    code(pg, 'info:crypte_fermee'); apres_code(pg)
    tout_demander(pg, ['anselme'])
    ev(pg, 'parler', {'id': 'anselme'})
    ev(pg, 'question', {'p': 'anselme', 'i': str(ic)})
    choisir(pg, 1)
    verifier('ME PRESSE PAS' in texte(pg) and 'je monte sonner' in texte(pg), 'on le presse : il n\'entend plus rien, puis « Bon, je monte sonner, moi »')
    verifier('_info:vieux_puits' in objets(pg) and '_info:cle_clou' not in objets(pg), 'raté : le code « Le vieux puits »')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(250)
    verifier('vieux puits' in texte(pg), 'Tim, depuis les toits')
    shot(pg, 'B-tim-puits')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    fermer(pg)
    ev(pg, 'gd-fete', {'id': 'grosbec'})
    verifier((modal(pg) or {}).get('vue') == 'fete' and 'presque' in texte(pg), 'le maire, à la fête : sa réplique (« … enfin, presque »), plus de petit dialogue')
    fermer(pg)
    pg.close()
    b.close()

print()
print('Erreurs de la console :', len(erreurs))
for e in erreurs[:12]: print('  ', e)
print('Échecs :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if echecs or erreurs else 0)
