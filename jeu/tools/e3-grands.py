"""Enquête 3, étape 2 (Bible § 13.14) : les grands dialogues du Barde, la fête et « Retenir le maire » (Playwright).
Deux parties, sur la tablette du Barde (le matin est sauté : le robot rend 10 bouquets au maire) :
  A : tout réussi — la lettre prêtée ; la nuit, la clé au clou, la Grosse Marie (ratée une fois, puis la deuxième chance), la fête
      (les indices notés), le maire retenu (2 sur 2), les quatre écoutes de la fête, puis Léo attrapé : les trois étapes (+10 pièces d'or) ;
  B : tout raté — le piège de la copie, puis une partie où le maire est fâché ; la nuit, la clé ratée (Tim montre le puits),
      la Grosse Marie ratée deux fois, le maire qui s'éloigne, Mélusine qui craque à la fête (le filet), Léo qui file à la première étape.
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

with sync_playwright() as p:
    b = p.chromium.launch()

    # ---------------- Partie A : tout réussi ----------------
    print('— Partie A : la lettre')
    pg = debut(b, 'A')
    apresmidi_maire(pg)
    verifier(pg.locator('#voile .gd-q').count() == 1, 'la question « Je voudrais vous parler de la lettre… » (avec son liseré)')
    shot(pg, 'A-maire-questions')
    # deux questions d'abord : le grand dialogue reste là quand même
    ev(pg, 'question', {'p': 'grosbec', 'i': '0'}); ev(pg, 'question', {'p': 'grosbec', 'i': '1'})
    verifier(pg.locator('#voile .gd-q').count() == 1 and pg.evaluate("() => M.barde.quotaAtteint('grosbec')"), 'deux questions posées : il s\'impatiente, mais le grand dialogue reste')
    pg.locator('#voile .gd-q').click(); pg.wait_for_timeout(700)
    m = modal(pg)
    verifier(m and m['type'] == 'grand' and m['g'] == 'lettre', 'la fenêtre du grand dialogue s\'ouvre')
    verifier(pg.locator('#voile .ma-ligne').count() == 4 and pg.locator('#voile .ma-ligne .b-lire').count() == 4, 'étape 1 : 4 réponses, chacune avec son 🔊')
    verifier(pg.locator('#voile .ma-dit .b-lire').count() >= 1, 'la réplique du maire a son 🔊')
    pg.wait_for_timeout(2600); shot(pg, 'A-lettre-1')
    choisir(pg, 0)
    verifier('Que puis-je pour vous' in texte(pg), 'bonne réponse : étape 2')
    choisir(pg, 2)
    verifier('vous me la rendez quand' in texte(pg), 'étape 3')
    pg.wait_for_timeout(2600); shot(pg, 'A-lettre-3')
    choisir(pg, 0)
    verifier('Avant ce soir' in texte(pg) and 'jusqu\'à minuit' in texte(pg), 'sa dernière réplique, puis « tout le monde sur la place jusqu\'à minuit »')
    verifier('_info:lettre' in objets(pg) and pg.evaluate("() => M.P().vus['grand:lettre']") == 'ok', 'le code « La lettre d\'Odette » est donné')
    pg.wait_for_timeout(2500); shot(pg, 'A-lettre-fin')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(300)
    verifier((modal(pg) or {}).get('type') == 'decouverte' and pg.locator('#voile .b-donne').count() == 1, 'la découverte, avec le code à donner')
    shot(pg, 'A-lettre-code')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier((modal(pg) or {}).get('type') == 'conv' and 'prêté la lettre' in pg.evaluate("() => document.querySelector('#voile .gd-q').textContent"), 'retour à la conversation : la boîte dit ce qui s\'est passé')
    fermer(pg)

    print('— Partie A : la nuit, la clé d\'Anselme')
    code(pg, 'moment:2'); apres_code(pg)
    verifier(pg.evaluate("() => M.momentId()") == 'nuit', 'la nuit')
    verifier(pg.evaluate("() => M.pnjIci('clocher').indexOf('anselme') >= 0"), 'Anselme est au clocher')
    ev(pg, 'parler', {'id': 'anselme'})
    verifier('Je voudrais vous demander quelque chose' in texte(pg) and 'sonner la Grosse Marie, maintenant' not in texte(pg), 'ses questions de la nuit ; pas encore celle de la Grosse Marie')
    shot(pg, 'A-anselme-nuit')
    idx = pg.evaluate("() => M.E().pnj.anselme.questions.map(function(q){ return q.grand || ''; })")
    ic, igm = idx.index('cle'), idx.index('gm')
    ev(pg, 'question', {'p': 'anselme', 'i': str(ic)})
    choisir(pg, 2); choisir(pg, 2)
    verifier('Dis-moi pourquoi' in texte(pg), 'étape 3 (les bonnes réponses en majuscules, lentement)')
    choisir(pg, 2)
    verifier('_info:cle_clou' in objets(pg), 'le code « La clé est au clou » pour le Pisteur')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(250)
    shot(pg, 'A-cle-code')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier('sonner la Grosse Marie, maintenant' in texte(pg), 'la question de la Grosse Marie est arrivée')
    print('— Partie A : la Grosse Marie (une deuxième chance)')
    ev(pg, 'question', {'p': 'anselme', 'i': str(igm)})
    choisir(pg, 0)
    verifier('tu m\'embrouilles' in texte(pg) and pg.evaluate("() => M.P().grands.gm.fini") == 'encore', 'raté une fois : « Bon, tu m\'embrouilles »')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier(pg.locator('#voile [data-act=gd-reprendre]').count() == 1, 'dans la conversation : « 🔁 Revenir à la charge »')
    shot(pg, 'A-gm-encore')
    pg.locator('#voile [data-act=gd-reprendre]').click(); pg.wait_for_timeout(300)
    verifier(pg.locator('#voile .ma-ligne').count() == 3, 'la mauvaise réponse déjà essayée a disparu')
    choisir(pg, 1); choisir(pg, 1); choisir(pg, 2)
    verifier('_info:grosse_marie' in objets(pg) and pg.evaluate("() => M.P().vus['grand:gm']") == 'ok', 'la Grosse Marie a sonné : le code pour le Pisteur')
    fermer(pg)

    print('— Partie A : la fête et le maire')
    verifier(pg.evaluate("() => M.pnjBulleCarte('grosbec')") == '❗', 'le maire porte un « ! » sur la carte')
    ev(pg, 'lieu', {'id': 'place'})
    t = texte(pg)
    verifier('la fête' in t.lower() and pg.locator('#voile [data-act=gd-fete]').count() >= 10, 'sur la place : la fête, chacun avec son bouton')
    verifier(pg.locator('#voile .gd-appel').count() == 1, 'le maire te cherche (un « ! »)')
    verifier(pg.locator('#voile [data-act=bd-porte]').count() == 1, '👂 Écouter en douce, à la fête')
    shot(pg, 'A-fete')
    ev(pg, 'gd-fete', {'id': 'grosbec'})
    verifier((modal(pg) or {}).get('g') == 'retenir' and 'Où sont-ils passés' in texte(pg), 'le premier petit dialogue du maire')
    pg.wait_for_timeout(2200); shot(pg, 'A-retenir-1')
    choisir(pg, 1, 'gd-ret')
    verifier('Ce gâteau sera magnifique' in texte(pg), 'bonne réponse')
    ev(pg, 'gd-ret-ok')
    verifier(not pg.evaluate("() => M.retenirDispo()"), 'le suivant attend une autre visite à la fête')
    for qui in ['silas', 'margot', 'fortune', 'gaspard']:
        ev(pg, 'gd-fete', {'id': qui})
        verifier((modal(pg) or {}).get('vue') == 'fete', f'{qui} à la fête : sa réplique')
    shot(pg, 'A-fete-gaspard')
    notes = pg.evaluate("() => JSON.stringify(M.P().carnet || M.P().notes || '')")
    verifier('vieux règlement' in notes and 'des bras' in notes, 'les indices de la fête sont notés dans le Carnet')
    fermer(pg)
    verifier(pg.evaluate("() => M.retenirDispo()"), 'le deuxième dialogue du maire est prêt')
    ev(pg, 'gd-fete', {'id': 'grosbec'})
    verifier('dire deux mots à Anselme' in texte(pg), 'le deuxième petit dialogue')
    choisir(pg, 0, 'gd-ret')
    verifier('_info:maire_retenu' in objets(pg), 'deux sur deux : « Le maire est retenu » (on s\'arrête là)')
    ev(pg, 'gd-ret-ok')
    verifier((modal(pg) or {}).get('type') == 'decouverte', 'la découverte du code')
    shot(pg, 'A-maire-retenu')
    fermer(pg)
    # les quatre écoutes de la fête
    vus = []
    for i in range(4):
        ev(pg, 'bd-porte', {'l': 'place'})
        vus.append(pg.evaluate("() => Object.keys(M.P().vus).filter(function(k){ return /^barde:oreille:.*_nuit$/.test(k); }).length"))
        fermer(pg)
    verifier(vus == [1, 2, 3, 4], 'les quatre écoutes de la fête, l\'une après l\'autre')

    print('— Partie A : Léo')
    code(pg, 'info:leo_attrape')
    m = modal(pg)
    verifier(m and m.get('g') == 'leo' and m.get('fixe'), 'le code « Léo attrapé » ouvre le dialogue de Léo (sans croix)')
    verifier('chat perdu' in texte(pg) and pg.locator('#voile [data-act=gd-leo-ment]').count() == 1, 'Léo ment d\'entrée ; « 🤥 Mensonge ? »')
    pg.wait_for_timeout(2600); shot(pg, 'A-leo-ment')
    pg.locator('#voile [data-act=gd-leo-ment]').click(); pg.wait_for_timeout(250)
    verifier('tous les soirs' in texte(pg), 'démasqué : sa vérité')
    pg.locator('#voile [data-act=gd-leo-suite]').click(); pg.wait_for_timeout(250)
    or0 = pg.evaluate("() => M.S.or || 0")
    choisir(pg, 2); choisir(pg, 2); choisir(pg, 1)
    verifier('porte aux quatre signes' in texte(pg) and 'corbeau' in texte(pg), 'trois étapes : la révélation')
    verifier(pg.evaluate("() => M.S.or || 0") == or0 + 10, '+10 pièces d\'or')
    pg.wait_for_timeout(3000); shot(pg, 'A-leo-fin')
    pg.close()

    # ---------------- Partie B : tout raté ----------------
    print('— Partie B : le piège de la copie')
    pg = debut(b, 'B')
    apresmidi_maire(pg)
    i = pg.evaluate("() => M.E().pnj.grosbec.questions.map(function(q){ return q.grand || ''; }).indexOf('lettre')")
    ev(pg, 'question', {'p': 'grosbec', 'i': str(i)})
    choisir(pg, 0); choisir(pg, 2); choisir(pg, 3)
    verifier('recopiez donc' in texte(pg) and '_info:copie' in objets(pg) and '_info:lettre' not in objets(pg), 'le piège : une copie, pas la lettre')
    shot(pg, 'B-copie')
    pg.close()
    print('— Partie B : le maire fâché')
    pg = debut(b, 'B2')
    apresmidi_maire(pg)
    ev(pg, 'question', {'p': 'grosbec', 'i': str(i)})
    choisir(pg, 3)
    verifier('Revenez plus tard' in texte(pg) and 'jusqu\'à minuit' in texte(pg), 'mauvais choix : « Bien, bien… Revenez plus tard. », puis la phrase de départ')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier(pg.evaluate("() => M.barde.quotaAtteint('grosbec')") and 'pas voulu te prêter' in pg.evaluate("() => document.querySelector('#voile .gd-q').textContent"), 'la porte se ferme jusqu\'au moment suivant')
    shot(pg, 'B-maire-ferme')
    fermer(pg)
    print('— Partie B : la nuit')
    code(pg, 'moment:2'); apres_code(pg)
    idx = pg.evaluate("() => M.E().pnj.anselme.questions.map(function(q){ return q.grand || ''; })")
    ic, igm = idx.index('cle'), idx.index('gm')
    ev(pg, 'parler', {'id': 'anselme'})
    ev(pg, 'question', {'p': 'anselme', 'i': str(ic)})
    choisir(pg, 3)
    verifier('UNE VIS' in texte(pg) and 'je monte sonner' in texte(pg), 'un malentendu de vieux sourd, puis « Bon, je monte sonner, moi »')
    verifier('_info:vieux_puits' in objets(pg) and '_info:cle_clou' not in objets(pg), 'raté : le code « Le vieux puits »')
    pg.locator('#voile [data-act=gd-suite]').click(); pg.wait_for_timeout(250)
    verifier('vieux puits' in texte(pg), 'Tim, depuis les toits')
    shot(pg, 'B-tim-puits')
    pg.locator('#voile [data-act=gd-retour]').click(); pg.wait_for_timeout(300)
    verifier('sonner la Grosse Marie, maintenant' in texte(pg), 'la question de la Grosse Marie arrive quand même')
    ev(pg, 'question', {'p': 'anselme', 'i': str(igm)})
    choisir(pg, 0); ev(pg, 'gd-reprendre', {'g': 'gm'}); choisir(pg, 3)
    verifier(pg.evaluate("() => M.P().vus['grand:gm']") == 'rate' and '_info:grosse_marie' not in objets(pg), 'deux fois raté : pas de Grosse Marie')
    fermer(pg)
    ev(pg, 'gd-fete', {'id': 'melusine'})
    verifier('C\'est moi qui ai écrit la lettre' in texte(pg) and '_info:aveu' in objets(pg), 'le filet : Mélusine craque à la fête (code pour le Sage)')
    shot(pg, 'B-melusine-filet')
    fermer(pg)
    ev(pg, 'gd-fete', {'id': 'grosbec'}); choisir(pg, 3, 'gd-ret'); ev(pg, 'gd-ret-ok')
    ev(pg, 'gd-fete', {'id': 'tim'}); fermer(pg)
    ev(pg, 'gd-fete', {'id': 'grosbec'}); choisir(pg, 2, 'gd-ret')
    verifier(pg.evaluate("() => M.P().vus['grand:retenir']") == 'rate' and '_info:maire_retenu' not in objets(pg), 'deux ratés : le maire s\'éloigne, pas de code')
    ev(pg, 'gd-ret-ok')
    verifier('s\'éloigne vers le clocher' in texte(pg), '« Le maire s\'éloigne vers le clocher… »')
    fermer(pg)
    verifier(pg.evaluate("() => M.pnjBulleCarte('grosbec')") != '❗', 'plus de « ! » sur le maire')
    code(pg, 'info:leo_attrape')
    ev(pg, 'gd-leo-suite'); choisir(pg, 0)
    verifier('croise les bras' in texte(pg) and 'file dans le noir' in texte(pg), 'Léo se ferme à la première étape et file')
    shot(pg, 'B-leo')
    pg.close()

    print('— Partie C : Léo s\'est enfui')
    pg = debut(b, 'C')
    code(pg, 'moment:1'); apres_code(pg); code(pg, 'moment:2'); apres_code(pg)
    code(pg, 'info:leo_enfui')
    verifier('renverse sa lanterne' in texte(pg) and pg.evaluate("() => M.P().vus['grand:leo']") == 'enfui', '« Léo s\'est enfui » : la scène, sans dialogue')
    shot(pg, 'C-leo-enfui')
    pg.close()
    b.close()

print()
print('Erreurs de la console :', len(erreurs))
for e in erreurs[:12]: print('  ', e)
print('Échecs :', len(echecs))
for e in echecs: print('  ✗', e)
sys.exit(1 if echecs or erreurs else 0)
