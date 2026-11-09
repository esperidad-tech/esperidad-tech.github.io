import os, json
from playwright.sync_api import sync_playwright
P = '/tmp/claude-0/-home-claude/8c316b0d-2d0f-5165-9ce1-c044c7ccfc27/scratchpad/essai/sons-essai.html'
ok = 0; ko = []
def verif(cond, msg):
    global ok
    if cond: ok += 1
    else: ko.append(msg)
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, has_touch=True)
    ctx.grant_permissions(['clipboard-read', 'clipboard-write'])
    pg = ctx.new_page()
    err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.on('console', lambda m: m.type in ('error', 'warning') and 'ERR_TUNNEL' not in m.text and err.append(m.text))
    pg.goto('file://' + P)
    pg.wait_for_timeout(300)
    nb = pg.evaluate("document.querySelectorAll('.version').length")
    verif(nb == 63, 'nombre de versions %d' % nb)
    # pas de son avant le premier toucher
    verif(pg.evaluate('ATELIER.contexte() === null'), 'contexte créé avant le toucher')
    # chaque bruitage se joue sans erreur
    cles = pg.evaluate("[...document.querySelectorAll('.version[data-cle]')].map(v => v.dataset.cle)")
    for c in cles:
        if c.startswith(('explo', 'combat', 'salles')): continue
        pg.click('.version[data-cle="%s"] .jouer' % c, force=True)
        pg.wait_for_timeout(60)
    verif(pg.evaluate('ATELIER.contexte() && ATELIER.contexte().state') == 'running', 'contexte pas en marche : %s' % pg.evaluate('ATELIER.contexte() && ATELIER.contexte().state'))
    verif(pg.evaluate("document.querySelectorAll('.jouer.joue').length") > 0, 'pas de bouton qui pulse')
    # une musique, puis une autre : une seule à la fois
    pg.click('.version[data-cle="exploA"] .jouer', force=True); pg.wait_for_timeout(500)
    verif(pg.inner_text('.version[data-cle="exploA"] .jouer').startswith('■'), 'exploA ne montre pas ■')
    pg.click('.version[data-cle="combatB"] .jouer', force=True); pg.wait_for_timeout(500)
    verif(pg.inner_text('.version[data-cle="exploA"] .jouer').startswith('▶'), 'exploA pas revenu à ▶')
    verif(pg.inner_text('.version[data-cle="combatB"] .jouer').startswith('■'), 'combatB ne montre pas ■')
    pg.click('.version[data-cle="combatB"] .jouer', force=True); pg.wait_for_timeout(300)
    verif(pg.inner_text('.version[data-cle="combatB"] .jouer').startswith('▶'), 'combatB ne s’arrête pas')
    # la démo des salles
    pg.click('.salle[data-salle="toiles"] .jouer', force=True); pg.wait_for_timeout(600)
    verif(pg.evaluate("document.querySelector('.salle.ici') && document.querySelector('.salle.ici').dataset.salle") == 'toiles', 'salle courante pas toiles')
    verif('Arrêter' in pg.inner_text('.jouer.demo'), 'bouton démo pas en Arrêter')
    pg.click('.salle[data-salle="atelier"] .jouer', force=True); pg.wait_for_timeout(600)
    verif(pg.evaluate("document.querySelector('.salle.ici').dataset.salle") == 'atelier', 'salle courante pas atelier')
    n_inst = pg.evaluate('ATELIER.instances()')
    pg.wait_for_timeout(5500)
    n_inst2 = pg.evaluate('ATELIER.instances()')
    verif(n_inst2 == 2, 'instances après fondu : %d (avant %d)' % (n_inst2, n_inst))
    pg.click('.jouer.demo', force=True); pg.wait_for_timeout(300)
    verif('Lancer' in pg.inner_text('.jouer.demo'), 'démo pas arrêtée')
    # les chaînes
    for b in pg.query_selector_all('.chaine .jouer'): b.click(); pg.wait_for_timeout(100)
    # les choix et le récapitulatif
    pg.click('.version[data-cle="arcB"] .garde', force=True); pg.click('.version[data-cle="ratFeuC"] .garde', force=True); pg.click('.version[data-cle="ratFeuA"] .garde', force=True)
    pg.click('.salle[data-salle="puits"] .garde', force=True)
    pg.fill('.carte:has(.version[data-cle="arcA"]) .remarque', 'un peu plus fort')
    r = pg.input_value('#recap')
    verif('L’arc : B' in r, 'récap arc')
    verif('Par le feu : A + C' in r, 'récap feu')
    verif('Une musique par salle : Le puits' in r, 'récap salles')
    verif('Remarques' in r and 'un peu plus fort' in r, 'récap remarque')
    verif(pg.evaluate("document.querySelector('.version[data-cle=\"arcB\"]').classList.contains('gardee')"), 'ligne gardée pas surlignée')
    pg.click('#copier', force=True); pg.wait_for_timeout(300)
    verif(pg.inner_text('#copie-ok').startswith('Copié'), 'copie : %s' % pg.inner_text('#copie-ok'))
    try:
        cb = pg.evaluate('navigator.clipboard.readText()')
        verif('L’arc : B' in cb, 'presse-papiers')
    except Exception as e:
        ko.append('presse-papiers illisible %s' % e)
    # la chaîne utilise la version cochée
    # le rechargement garde les choix
    pg.reload(); pg.wait_for_timeout(300)
    verif(pg.is_checked('.version[data-cle="arcB"] input'), 'choix pas gardé au rechargement')
    verif('un peu plus fort' in pg.input_value('#recap'), 'remarque perdue au rechargement')
    # tout arrêter
    pg.click('.version[data-cle="exploB"] .jouer', force=True); pg.wait_for_timeout(300)
    pg.click('#stop', force=True); pg.wait_for_timeout(300)
    verif(pg.inner_text('.version[data-cle="exploB"] .jouer').startswith('▶'), 'tout arrêter ne coupe pas la musique')
    # les boutons 🔊 : un par texte de plus de 3 mots
    manque = pg.evaluate("""() => {
      const r = [];
      document.querySelectorAll('p, .dit').forEach(x => {
        const t = [...x.childNodes].filter(n => !(n.classList && n.classList.contains('voix'))).map(n => n.textContent).join(' ').trim();
        if (t.split(/\\s+/).filter(w => /[\\wÀ-ÿ]/.test(w)).length > 3 && !x.querySelector('.voix')) r.push(t.slice(0, 40));
      });
      return r;
    }""")
    verif(not manque, 'textes sans 🔊 : %s' % manque)
    # cibles tactiles
    petites = pg.evaluate("""() => [...document.querySelectorAll('button, label.garde, input')].filter(b => { const r = b.getBoundingClientRect(); return r.width > 0 && (r.width < 44 || r.height < 44) && !(b.type === 'checkbox'); }).map(b => b.className + ' ' + b.textContent.slice(0, 20))""")
    verif(not petites, 'cibles trop petites : %s' % petites)
    jaunes = pg.evaluate("""() => [...document.querySelectorAll('.jouer')].map(b => getComputedStyle(b)).filter(s => s.color !== 'rgb(0, 0, 0)').length""")
    verif(jaunes == 0, 'bouton jaune sans texte noir')
    verif(not err, 'erreurs JS : %s' % err)
    nav.close()
print('réussis', ok, 'ratés', len(ko))
for k in ko: print(' -', k)
