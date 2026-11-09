#!/usr/bin/env python3
"""Test de l'Atelier des sons (essai/sons-essai.html, construit par construire-sons.py) :
sections rétractables imbriquées (toutes fermées au départ, mémorisées), compteurs, statuts (✅ précochés d'après la
table CHOIX du jeu, 🆕, 🎮), chaque bouton joue sans erreur (bruitages, sons du jeu, musiques, couleurs de salle,
enchaînements), la copie des choix couvre toutes les sections, les règles de la page (🔊, boutons jaunes à texte noir,
cibles de 44 px, pas de défilement de côté, aucune lecture vocale toute seule).
   flock /tmp/brumeval-pw.lock python3 test-page.py [--captures DOSSIER]"""
import os, sys, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
P = os.path.join(ICI, '..', 'sons-essai.html')
CAP = sys.argv[sys.argv.index('--captures') + 1] if '--captures' in sys.argv else None
ok = 0; ko = []
def verif(cond, msg):
    global ok
    if cond: ok += 1; print('  ok  ' + msg)
    else: ko.append(msg); print('  ÉCHEC  ' + msg)

with sync_playwright() as p:
    nav = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = nav.new_context(viewport={'width': 1280, 'height': 800}, has_touch=True, device_scale_factor=1)
    ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: m.type in ('error', 'warning') and 'ERR_' not in m.text and err.append(m.text))
    pg.route('**/fonts.g*/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.add_init_script("window.__parle = 0; try{ speechSynthesis.speak = function(u){ window.__parle++; window.__dernier = u.text; }; }catch(e){}")
    pg.goto('file://' + P); pg.wait_for_timeout(400)

    print('— au départ')
    verif(pg.evaluate('ATELIER.contexte() === null'), 'pas de son avant le premier toucher')
    verif(pg.evaluate('window.__parle') == 0, 'aucune lecture vocale toute seule')
    verif(pg.evaluate("document.querySelectorAll('details.sec[open]').length") == 0, 'toutes les sections sont fermées au départ')
    haut = pg.evaluate('document.documentElement.scrollHeight')
    verif(haut <= 800, 'tout fermé, la page tient dans l’écran sans défiler (%d px)' % haut)
    if CAP: pg.screenshot(path=os.path.join(CAP, 'paysage-ferme.png'))
    titres = pg.evaluate("[...document.querySelectorAll('#atelier > details > summary .sec-titre')].map(x => x.textContent)")
    verif(titres == ['Donjon', 'Musiques', 'Le jeu', 'Mini-jeux'], 'les grandes sections : %s' % titres)
    sous = pg.evaluate("[...document.querySelectorAll('details[data-id=donjon] > .sec-corps > .sous > details > summary .sec-titre')].map(x => x.textContent)")
    verif(sous == ['Héros', 'Ennemis', 'Objets et salles'], 'dans le Donjon : %s' % sous)
    monstres = pg.evaluate("[...document.querySelectorAll('details[data-id=ennemis] > .sec-corps > .sous > details > summary .sec-titre')].map(x => x.textContent)")
    verif(len(monstres) >= 10 and 'Bourbe (boss)' in monstres and 'Rat d’égout' in monstres, 'une sous-section par monstre (%d) : %s' % (len(monstres), ', '.join(monstres)))
    c = pg.evaluate("(() => { var d = document.querySelector('details[data-id=ennemis] > summary'); return {nb: d.querySelector('.nb').textContent, neuf: d.querySelector('.neuf').textContent}; })()")
    verif('sons' in c['nb'] and '🆕' in c['neuf'], 'le compteur sur le titre « Ennemis » : %s · %s' % (c['nb'], c['neuf']))
    verif(pg.evaluate("[...document.querySelectorAll('details.sec > summary .nb')].every(x => /\\d+ sons?/.test(x.textContent))"), 'chaque section montre son nombre de sons')

    print('— les statuts')
    st = pg.evaluate("""(() => { var r = {valide:0, nouveau:0, jeu:0, autre:0}; document.querySelectorAll('.son:not(.chaine)').forEach(c => {
        var i = c.querySelector('.st').textContent; r[{'✅':'valide', '🆕':'nouveau', '🎮':'jeu'}[i] || 'autre']++; }); return r; })()""")
    verif(st['autre'] == 0 and st['valide'] >= 22 and st['nouveau'] >= 50 and st['jeu'] >= 40, 'chaque son a son statut : %s' % st)
    pre = pg.evaluate("""(() => { var m = {}; document.querySelectorAll('.v').forEach(v => { if(v.querySelector('input').checked) m[v.dataset.cle] = 1; }); return m; })()""")
    choix = pg.evaluate('CHOIX_ROMAIN')
    attendus = {k + v for k, l in choix.items() for v in l}
    verif(all(k in pre for k in attendus), 'les versions gardées par Romain (table CHOIX du jeu) sont précochées (%d)' % len(attendus))
    verif('ratCritiqueA' in pre and 'ratCritiqueC' in pre and 'ratCritiqueB' not in pre, 'coup critique : A et C validés, pas B')
    verif('chairDC' in pre and 'chairDA' not in pre and 'metalB' in pre and 'metalA' not in pre, 'dague : seulement les versions gardées (chair C, métal B)')
    verif(all(k in pre for k in ['salles:puits', 'salles:toiles', 'salles:atelier']), 'les trois couleurs de salle sont précochées')
    verif(not any(k.startswith(('icone', 'bourbe', 'j_', 'c_', 's_')) for k in pre), 'rien de nouveau ni de déjà-dans-le-jeu n’est précoché')
    verif(pg.evaluate("document.querySelector('.son[data-id=ratCritique] .st').textContent") == '✅', 'le coup critique est marqué ✅')
    verif(pg.evaluate("document.querySelector('.son[data-id=icone] .st').textContent") == '🆕' and pg.evaluate("document.querySelectorAll('.son[data-id=icone] .v').length") == 3,
          'le petit son des icônes : 3 propositions 🆕')

    print('— ouvrir, fermer, mémoriser')
    pg.click('#ouvrir-tout'); pg.wait_for_timeout(100)
    verif(pg.evaluate("document.querySelectorAll('details.sec:not([open])').length") == 0, '« Tout ouvrir » ouvre tout')
    pg.click('#fermer-tout'); pg.wait_for_timeout(100)
    verif(pg.evaluate("document.querySelectorAll('details.sec[open]').length") == 0, '« Tout fermer » ferme tout')
    verif(pg.evaluate("getComputedStyle(document.getElementById('panneau')).display") == 'none', 'le panneau du récapitulatif est caché tant qu’on ne touche pas « Voir »')
    for sid in ['donjon', 'ennemis', 'e-bourbe']:
        pg.click('details[data-id="%s"] > summary' % sid); pg.wait_for_timeout(80)
    verif(pg.evaluate("document.querySelector('details[data-id=e-bourbe]').open"), 'on ouvre une section en touchant son titre')
    haut = pg.evaluate('document.documentElement.scrollHeight')
    verif(haut <= 1100, 'Donjon › Ennemis › Bourbe ouverts : la page reste courte (%d px)' % haut)
    if CAP: pg.screenshot(path=os.path.join(CAP, 'paysage-bourbe.png'))
    pg.reload(); pg.wait_for_timeout(400)
    verif(pg.evaluate("['donjon', 'ennemis', 'e-bourbe'].every(id => document.querySelector('details[data-id=' + id + ']').open) && document.querySelectorAll('details.sec[open]').length === 3"),
          'les sections ouvertes sont mémorisées')

    print('— chaque bouton joue')
    pg.click('#ouvrir-tout'); pg.wait_for_timeout(150)
    cles = pg.evaluate("""[...document.querySelectorAll('.son:not(.chaine)')].filter(c => !c.querySelector('.jouer') || true).flatMap(c => {
        var id = c.dataset.id, e = ATELIER.sons.find(x => x.s.id === id).s; if(e.m || e.c || e.salles) return []; return [...c.querySelectorAll('.v')].map(v => v.dataset.cle); })""")
    n = 0
    for i, k in enumerate(cles):
        pg.click('.v[data-cle="%s"] .jouer' % k, force=True); pg.wait_for_timeout(30); n += 1
        if i % 15 == 14: pg.click('#stop', force=True); pg.wait_for_timeout(60)
    pg.click('#stop', force=True); pg.wait_for_timeout(200)
    verif(n >= 200 and not err, 'les %d bruitages et sons du jeu jouent sans erreur' % n)
    verif(pg.evaluate("ATELIER.contexte() && ATELIER.contexte().state") == 'running', 'le son tourne')
    mus = pg.evaluate("""ATELIER.sons.filter(e => e.s.m).flatMap(e => ATELIER.versions(e.s).map(v => e.s.id + v[0]))""")
    bon = True
    for k in mus:
        pg.click('.v[data-cle="%s"] .jouer' % k, force=True); pg.wait_for_timeout(250)
        bon = bon and pg.evaluate('ATELIER.musique()') == k and pg.inner_text('.v[data-cle="%s"] .jouer' % k) == '■'
    verif(bon and not err, 'les %d musiques jouent, une seule à la fois, avec ■ sur celle qui joue' % len(mus))
    pg.click('.v[data-cle="%s"] .jouer' % mus[-1], force=True); pg.wait_for_timeout(200)
    verif(pg.evaluate('ATELIER.musique()') is None and pg.inner_text('.v[data-cle="%s"] .jouer' % mus[-1]) != '■', 'toucher la musique qui joue l’arrête')
    pg.click('.v[data-cle="salles:toiles"] .jouer', force=True); pg.wait_for_timeout(300)
    verif(pg.evaluate('ATELIER.salle()') == 'toiles', 'une couleur de salle se joue sur le fond du donjon')
    pg.click('.v[data-cle="canauxB"] .jouer', force=True); pg.wait_for_timeout(300)
    verif(pg.evaluate('ATELIER.salle()') == 'canauxB' and pg.inner_text('.v[data-cle="canauxB"] .jouer') == '■', 'on passe aux canaux (B), en fondu')
    pg.click('.v[data-cle="ossuaireA"] .jouer', force=True); pg.wait_for_timeout(300)
    pg.click('.v[data-cle="ossuaireA"] .jouer', force=True); pg.wait_for_timeout(300)
    verif(pg.evaluate('ATELIER.salle()') is None, 'toucher la salle en cours l’arrête')
    for b in pg.query_selector_all('.son.chaine .jouer'): b.click(force=True); pg.wait_for_timeout(80)
    pg.click('#stop', force=True); pg.wait_for_timeout(200)
    verif(not err, 'les enchaînements jouent sans erreur')
    pg.click('.v[data-cle="exploB"] .jouer', force=True); pg.wait_for_timeout(300)
    pg.click('#stop', force=True); pg.wait_for_timeout(300)
    verif(pg.evaluate('ATELIER.musique()') is None, '« Tout arrêter » coupe la musique')

    print('— les choix et la copie')
    for k in ['bourbeCriB', 'j_clic', 'canauxA', 'c_touille', 'iconeB']:
        pg.click('.v[data-cle="%s"] .garde' % k, force=True)
    pg.click('.v[data-cle="arcB"] .garde', force=True)                          # Romain change d'avis
    r = pg.evaluate('ATELIER.texteRecap()')
    verif('[Donjon › Ennemis › Bourbe (boss)]' in r and '- Coassement : B (nouveau)' in r, 'le récapitulatif dit la section de chaque choix (Bourbe)')
    verif('[Le jeu]' in r and '- Bouton touché : validé' in r and '[Mini-jeux › Le chaudron]' in r and '- On touille : validé' in r, '… les sons du jeu et des mini-jeux')
    verif('[Musiques]' in r and '- Les canaux : A (nouveau)' in r and '- Couleurs des salles : Puits + Toiles + Atelier' in r, '… les musiques')
    verif('- L’arc : A + C' in r and '- Coup critique : A + C' in r and '- Toucher une icône : B (nouveau)' in r, '… le donjon (l’arc sans B, le critique A + C, l’icône B)')
    verif('pas encore choisi :' in r, '… et ce qui n’est pas encore choisi')
    pg.click('#voir'); pg.fill('#note', 'Bourbe : encore plus gros'); pg.wait_for_timeout(100)
    verif('Remarque : Bourbe : encore plus gros' in pg.input_value('#recap'), 'une remarque s’ajoute au récapitulatif')
    pg.click('#copier', force=True); pg.wait_for_timeout(300)
    verif(pg.inner_text('#copie-ok').startswith('Copié'), 'le bouton du bas copie (%s)' % pg.inner_text('#copie-ok'))
    try:
        cb = pg.evaluate('navigator.clipboard.readText()')
        verif('Coassement : B' in cb and 'Bouton touché : validé' in cb and 'Les canaux : A' in cb, 'le presse-papiers contient les choix de toutes les sections')
    except Exception as e:
        ko.append('presse-papiers illisible %s' % e)
    verif(pg.evaluate("/\\d+ cochés/.test(document.getElementById('compte').textContent)"), 'le nombre de cases cochées est affiché en bas')
    neuf_avant = pg.evaluate("document.querySelector('details[data-id=e-bourbe] > summary .neuf').textContent")
    verif(neuf_avant.startswith('8'), 'le compteur 🆕 de Bourbe baisse quand on valide (%s)' % neuf_avant)
    pg.reload(); pg.wait_for_timeout(400)
    verif(pg.is_checked('.v[data-cle="bourbeCriB"] input') and not pg.is_checked('.v[data-cle="arcB"] input') and pg.is_checked('.v[data-cle="arcA"] input'), 'les choix restent après rechargement')

    print('— « à refaire » devant A, B, C (Romain, 12 h 03)')
    premier = pg.evaluate("[...document.querySelector('.son[data-id=bourbeCri] .vs').children].map(x => x.className)")
    verif(premier and premier[0] == 'vr', 'le bouton 🔁 « à refaire » est devant A, B, C (%s)' % premier[:2])
    neuf0 = pg.evaluate("document.querySelector('details[data-id=e-bourbe] > summary .neuf').textContent")
    pg.evaluate("document.querySelector('.son[data-id=bourbeRot] .refaire-b').click()")
    pg.evaluate("""(() => { const q = document.querySelector('.son[data-id=bourbeRot] .pourquoi'); q.value = 'trop long'; q.dispatchEvent(new Event('input')); })()""")
    pg.evaluate("document.querySelector('.son[data-id=bourbeCri] .refaire-b').click()")
    r = pg.evaluate('ATELIER.texteRecap()')
    verif('🔁 À REFAIRE (trop long)' in r, 'le récapitulatif dit « à refaire » et pourquoi')
    verif('- Coassement : 🔁 À REFAIRE — en attendant : B' in r, '… et ce qui reste coché en attendant')
    neuf1 = pg.evaluate("document.querySelector('details[data-id=e-bourbe] > summary .neuf').textContent")
    verif(int(neuf1.split()[0] or 0) == int(neuf0.split()[0]) - 1, 'un son « à refaire » ne compte plus comme 🆕 (%s → %s)' % (neuf0, neuf1))
    pg.reload(); pg.wait_for_timeout(400)
    verif(pg.evaluate("document.querySelector('.son[data-id=bourbeRot]').classList.contains('a-refaire') && document.querySelector('.son[data-id=bourbeRot] .pourquoi').value === 'trop long'"), '« à refaire » et le pourquoi restent après rechargement')
    pg.evaluate("document.querySelector('.son[data-id=bourbeCri] .refaire-b').click()")
    verif('Coassement : 🔁' not in pg.evaluate('ATELIER.texteRecap()'), 'un second toucher enlève « à refaire »')

    print('— les règles de la page')
    pg.click('#ouvrir-tout'); pg.wait_for_timeout(150)
    manque = pg.evaluate("""() => { const r = [], mots = t => t.split(/\\s+/).filter(w => /[\\wÀ-ÿ]/.test(w)).length;
      document.querySelectorAll('p, .nom .t, summary .sec-titre').forEach(x => {
        const t = [...x.childNodes].filter(n => !(n.classList && n.classList.contains('voix'))).map(n => n.textContent).join(' ').trim();
        if (mots(t) > 3 && !x.querySelector('.voix')) r.push(t.slice(0, 40)); });
      return r; }""")
    verif(not manque, 'tout texte de plus de 3 mots a son 🔊 (titres courts) : %s' % manque)
    pg.click('#accueil .voix'); pg.wait_for_timeout(100)
    verif(pg.evaluate('window.__parle') == 1 and 'petit carré' in pg.evaluate('window.__dernier'), 'le 🔊 de l’accueil lit la phrase')
    petites = pg.evaluate("""() => [...document.querySelectorAll('.jouer, .refaire-b, .petit:not([hidden]), .stop, .voix, details.sec > summary, label.garde')].filter(b => { const r = b.getBoundingClientRect();
        const minL = b.matches('label.garde') ? 40 : 44, minH = b.matches('label.garde') ? 30 : 44; return r.width > 0 && (r.width < minL || r.height < minH); }).map(b => b.className + ' ' + b.textContent.slice(0, 15))""")
    verif(not petites, 'cibles assez grandes pour un doigt : %s' % petites[:5])
    jaunes = pg.evaluate("""() => [...document.querySelectorAll('.jouer')].filter(b => getComputedStyle(b).color !== 'rgb(0, 0, 0)' || !/255, 210, 63|241, 234, 211/.test(getComputedStyle(b).backgroundColor)).length""")
    verif(jaunes == 0, 'boutons « écouter » jaunes à texte noir')
    for w, h in [(1280, 800), (800, 1280), (390, 844)]:
        pg.set_viewport_size({'width': w, 'height': h}); pg.wait_for_timeout(150)
        lg = pg.evaluate('document.documentElement.scrollWidth')
        verif(lg <= w, 'pas de défilement de côté en %d×%d (%d px)' % (w, h, lg))
    pg.set_viewport_size({'width': 800, 'height': 1280}); pg.wait_for_timeout(150)
    cols = pg.evaluate("getComputedStyle(document.querySelector('details[open] .grille')).gridTemplateColumns.split(' ').length")
    verif(cols == 3, 'portrait 800 : 3 sons par rangée (%d)' % cols)
    pg.set_viewport_size({'width': 1280, 'height': 800}); pg.wait_for_timeout(150)
    cols = pg.evaluate("getComputedStyle(document.querySelector('details[open] .grille')).gridTemplateColumns.split(' ').length")
    verif(cols == 4, 'paysage 1280 : 4 sons par rangée (%d)' % cols)
    if CAP:
        pg.click('#fermer-tout'); pg.wait_for_timeout(100)
        pg.set_viewport_size({'width': 800, 'height': 1280}); pg.wait_for_timeout(150)
        pg.screenshot(path=os.path.join(CAP, 'portrait-ferme.png'))
        for sid in ['donjon', 'heros', 'h-arc', 'h-potions', 'ennemis', 'e-gardien']:
            pg.click('details[data-id="%s"] > summary' % sid); pg.wait_for_timeout(60)
        pg.screenshot(path=os.path.join(CAP, 'portrait-ouvert.png'))
        pg.set_viewport_size({'width': 1280, 'height': 800}); pg.wait_for_timeout(150)
        pg.screenshot(path=os.path.join(CAP, 'paysage-ouvert.png'))
    verif(not err, 'aucune erreur JavaScript : %s' % err[:3])
    nav.close()
print('réussis', ok, 'ratés', len(ko))
for k in ko: print(' -', k)
sys.exit(1 if ko else 0)
