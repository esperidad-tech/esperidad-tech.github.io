"""Le parc à chat de Mimi (Bible §12.71), dans le vrai jeu (Playwright) :
- une famille d'affaires complète : un morceau du parc arrive dans un carton (le tunnel d'abord) ; cinq familles : les cinq morceaux ;
- les morceaux sortis des cartons sont dans la pièce, dessinés ; on les touche : ils changent de forme et de couleur ;
- Mimi y joue : elle traverse le tunnel (cachée derrière la toile), dort dans le hamac, tape la souris sur ressort (qui se balance),
  entre dans la cabane (sa tête à la porte, elle ressort quand on frappe), grimpe au toboggan et glisse ;
- une image de chaque (jeu/test/mimi/parc-*.png) ; aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-parc.py [iphone]"""
import sys, os, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
V = "Atelier._vue()"
PARC = ['tunnel_chat', 'hamac_chat', 'ressort_souris', 'cabane_chat', 'toboggan_chat']

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)
def shot(pg, nom): pg.wait_for_timeout(250); pg.screenshot(path=f'{OUT}/{"tel-" if TEL else ""}parc-{nom}.png')
def toast(pg): return pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }")
def chat(pg, cid): return pg.evaluate(f"() => {V}._chat('{cid}')")
def cartons(pg):
    for i in range(120):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
def installer(pg, noms):
    """ce qui est sorti des cartons attend dans le carton du coin 📦 : on installe dans la pièce ce dont le nom est dans « noms »"""
    for i in range(30):
        pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-coin'); if(c) c.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(350)
        k = pg.evaluate("(re) => { var l = [].slice.call(document.querySelectorAll('#atelier-ici [data-res]')); var b = l.filter(function(x){ return new RegExp(re).test(x.textContent); })[0]; if(b){ b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return b.textContent; } return null; }", noms)
        pg.wait_for_timeout(400)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
        if not k: break
def calme(pg, cid):
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', 'assis'); }}"); pg.wait_for_timeout(250)
def objet(pg, t): return pg.evaluate(f"() => {{ var o = M.S.atelier.objets.filter(function(x){{ return x.t === '{t}'; }})[0]; if(!o) return null; var p = {V}._pos(o.id); return {{id:o.id, x:p.x, y:p.y, s:p.s, st:o.st || 0, dedans:!!o.dedans, sur:!!o.sur}}; }}")
def voir(pg, o): pg.evaluate(f"() => {V}._voir({o['x']}, {o['y'] - 60})"); pg.wait_for_timeout(350)
def visible(pg, cid): return pg.evaluate(f"""() => {{ var d = document.querySelector('#atelier-ici [data-obj="{cid}"]'); if(!d) return false; var c = getComputedStyle(d); return c.opacity === '1' && c.visibility === 'visible' && c.display !== 'none'; }}""")

with sync_playwright() as p:
    b = p.chromium.launch()
    vp = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
    pg = b.new_context(viewport=vp, has_touch=True, device_scale_factor=2 if TEL else 1).new_page()
    pg.set_default_timeout(9000)
    pg.on('console', lambda m: erreurs.append(m.text) if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text and 'ERR_TUNNEL' not in m.text and 'Failed to load' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'PAGEERROR {e}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=alchimiste]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', 'Lia'); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.S.heros.joueur = 'adulte'; M.sauver(); M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="2"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.wait_for_timeout(200)
    if pg.locator('[data-act=lettre-suite]').count(): pg.click('[data-act=lettre-suite]')
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(500)
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    cartons(pg); installer(pg, 'Gamelle|Litière|Panier')
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); M.S.atelier.tama.envieT = 1e9; M.S.atelier.tama.envie = null; }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate("() => (M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0] || {}).id || null")
    verifier(cid is not None, 'Mimi est là')
    # --- rien tant qu'aucune famille n'est complète ; une famille : le tunnel arrive dans un carton ---
    pg.wait_for_timeout(5200)
    t = pg.evaluate("() => M.S.atelier.tama")
    verifier(t['parc'] == [] and t['fam'] == {}, f'aucune famille complète : pas de morceau du parc ({t["parc"]})')
    pg.evaluate(f"() => {{ M.S.atelier.tama.fam = {{recre:1}}; return {V}._parcDonner(); }}"); pg.wait_for_timeout(700)
    t = pg.evaluate("() => M.S.atelier.tama"); tx = toast(pg)
    verifier(t['parc'] == ['tunnel_chat'] and 'parc à chat' in tx and 'tunnel' in tx and pg.locator('#atelier-ici .at-carton').count() == 1, f'une famille complète : un colis pour le parc à chat, le tunnel ({tx[:90]})')
    shot(pg, 'colis')
    pg.evaluate(f"() => {{ M.S.atelier.tama.fam = {{recre:1, ventre:1, belle:1, reine:1, envies:1}}; return {V}._parcDonner(); }}"); pg.wait_for_timeout(500)
    verifier(pg.evaluate("() => M.S.atelier.tama.parc") == PARC and pg.evaluate(f"() => {V}._parcDonner().length") == 0, 'cinq familles : les cinq morceaux, une seule fois chacun')
    cartons(pg); pg.wait_for_timeout(1200)
    res = pg.evaluate("() => M.S.atelier.reserve.map(function(x){ return x.t; })")
    verifier(all(t in res for t in PARC), f'les cartons ouverts : les cinq morceaux attendent dans le carton du coin 📦')
    installer(pg, 'Tunnel|Hamac|Souris sur ressort|Cabane|Toboggan'); pg.wait_for_timeout(400)
    la = {t: objet(pg, t) for t in PARC}
    verifier(all(la[t] is not None for t in PARC), f'sortis des cartons, ils sont dans la pièce ({[t for t in PARC if la[t]]})')
    pg.evaluate(f"() => {V}._voir(600, 700)"); pg.wait_for_timeout(400); shot(pg, 'piece')
    # (on les touche : ils changent de forme et de couleur)
    o = la['cabane_chat']; voir(pg, o)
    pg.evaluate(f"""() => {{ var d = document.querySelector('#atelier-ici [data-obj="{o['id']}"]'); var r = d.getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height * .45; ['pointerdown', 'pointerup', 'click'].forEach(function(n){{ d.dispatchEvent(new PointerEvent(n, {{bubbles:true, clientX:x, clientY:y, pointerId:1, isPrimary:true}})); }}); }}""")
    pg.wait_for_timeout(500)
    print('   (la cabane, style :', o['st'], '→', objet(pg, 'cabane_chat')['st'], ')')
    # (le mode d'essai du jeu : un bouton 🧪 dans sa barre donne tout d'un coup — ici tout est déjà là, il ne casse rien)
    for i in range(4):
        if pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-barre'); return !!b && !b.hidden; }"): break
        pg.locator('#atelier-ici .at-mimi-bt').click(force=True); pg.wait_for_timeout(350)
    nb = pg.locator('#atelier-ici [data-mimi="essai"]').count()
    if nb: pg.locator('#atelier-ici [data-mimi="essai"]').click(); pg.wait_for_timeout(500)
    m = pg.evaluate("() => { var e = M.S.atelier; return {j:e.mimi.jouets.length, s:e.mimi.soins.length, a:e.garde.a.length, p:e.mimi.peaux.p.length, fam:Object.keys(e.tama.fam).length}; }")
    tous = pg.evaluate("() => Object.keys(Atelier.ACCESSOIRES).length")      # (17 novembre : les habits rigolos en plus — ceux de la malle)
    verifier(nb == 1 and tous >= 38 and m == {'j': 7, 's': 5, 'a': tous, 'p': 4, 'fam': 5} and 'Essai' in toast(pg), f'en mode d\'essai : le bouton 🧪 donne toutes ses affaires ({m})')
    cartons(pg); pg.wait_for_timeout(600)
    # --- le tunnel : elle le traverse, cachée derrière la toile ---
    calme(pg, cid); o = objet(pg, 'tunnel_chat'); voir(pg, o)
    r = pg.evaluate(f"() => {V}._parc('{cid}', 'tunnel_chat')")
    t0 = time.time(); dedans = False; cachee = 0; vues = []
    while time.time() - t0 < 14:
        c = chat(pg, cid); pos = c['pos'] or {}
        if 'at-c-tapi' in pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{cid}\"]').className"):
            if not dedans: dedans = True; pg.wait_for_timeout(450); shot(pg, 'tunnel')
        if dedans and not c['anim'] and c['pose'] == 'assis': break
        pg.wait_for_timeout(120)
    c = chat(pg, cid)
    verifier(r == 'tunnel_chat' and dedans and c['pos'] and c['pos']['x'] > o['x'] + 90 * o['s'], f'le tunnel : elle s\'aplatit, entre par un bout et ressort par l\'autre ({round(time.time() - t0, 1)} s)')
    # --- le hamac : elle saute dedans et s'endort ---
    calme(pg, cid); o = objet(pg, 'hamac_chat'); voir(pg, o)
    r = pg.evaluate(f"() => {V}._parc('{cid}', 'hamac_chat')")
    t0 = time.time()
    while time.time() - t0 < 12 and not chat(pg, cid)['dort']: pg.wait_for_timeout(200)
    c = chat(pg, cid); pg.wait_for_timeout(400); shot(pg, 'hamac')
    verifier(r == 'hamac_chat' and c['dort'] and c['pos'] and c['pos'].get('sur') and c['pos']['sur']['o'] == o['id'], f'le hamac : elle saute dedans et s\'y endort ({round(time.time() - t0, 1)} s)')
    # --- la souris sur ressort : elle la tape, la souris se balance ---
    calme(pg, cid); o = objet(pg, 'ressort_souris'); voir(pg, o)
    r = pg.evaluate(f"() => {V}._parc('{cid}', 'ressort_souris')")
    t0 = time.time(); bat = False
    while time.time() - t0 < 10 and not bat:
        bat = pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{o['id']}\"]').classList.contains('at-ressort-bat')"); pg.wait_for_timeout(120)
    shot(pg, 'ressort')
    verifier(r == 'ressort_souris' and bat and chat(pg, cid)['pose'] == 'tape', f'la souris sur ressort : elle la tape, la souris se balance ({round(time.time() - t0, 1)} s)')
    # --- la cabane : elle entre, on voit sa tête à la porte ; on frappe : elle ressort ---
    pg.wait_for_timeout(2400); calme(pg, cid); o = objet(pg, 'cabane_chat'); voir(pg, o)
    r = pg.evaluate(f"() => {V}._parc('{cid}', 'cabane_chat')")
    t0 = time.time()
    while time.time() - t0 < 10 and not objet(pg, 'cabane_chat')['dedans']: pg.wait_for_timeout(150)
    pg.wait_for_timeout(500); shot(pg, 'cabane')
    tete = pg.evaluate(f"() => document.querySelector('#atelier-ici [data-obj=\"{o['id']}\"]').innerHTML.indexOf('atg-mimt') >= 0")
    verifier(r == 'cabane_chat' and objet(pg, 'cabane_chat')['dedans'] and tete and not visible(pg, cid), f'la cabane : elle entre ; on ne voit plus que sa tête, à la porte ({round(time.time() - t0, 1)} s)')
    verifier('Pas de modèle' in (pg.locator('#atelier-ici .at-photo-bt').click() or pg.wait_for_timeout(400) or toast(pg)), 'cachée dans sa cabane : pas de photo')
    pg.evaluate(f"""() => {{ var d = document.querySelector('#atelier-ici [data-obj="{o['id']}"]'); var r = d.getBoundingClientRect(); var x = r.left + r.width / 2, y = r.top + r.height * .45; ['pointerdown', 'pointerup', 'click'].forEach(function(n){{ d.dispatchEvent(new PointerEvent(n, {{bubbles:true, clientX:x, clientY:y, pointerId:1, isPrimary:true}})); }}); }}""")
    pg.wait_for_timeout(900)
    o2 = objet(pg, 'cabane_chat')
    verifier(not o2['dedans'] and visible(pg, cid), 'on frappe à sa porte : elle ressort, et on la revoit')
    shot(pg, 'cabane-sortie')
    # --- le toboggan : elle grimpe sur la plateforme, puis glisse jusqu'en bas ---
    pg.wait_for_timeout(2200); calme(pg, cid); o = objet(pg, 'toboggan_chat'); voir(pg, o)
    r = pg.evaluate(f"() => {V}._parc('{cid}', 'toboggan_chat')")
    t0 = time.time(); haut = False; glisse = False
    while time.time() - t0 < 16:
        c = chat(pg, cid); pos = c['pos'] or {}
        if pos.get('sur') and pos['sur']['o'] == o['id'] and not c['anim'] and not haut: haut = True; shot(pg, 'toboggan-haut')
        if haut and not pos.get('sur') and c['anim'] and not glisse: glisse = True; pg.wait_for_timeout(300); shot(pg, 'toboggan-glisse')
        if haut and not pos.get('sur') and not c['anim']: break
        pg.wait_for_timeout(100)
    c = chat(pg, cid)
    verifier(r == 'toboggan_chat' and haut and c['pos'] and not c['pos'].get('sur') and c['pos']['x'] > o['x'] + 90 * o['s'], f'le toboggan : elle grimpe en haut, s\'assoit, et glisse jusqu\'en bas ({round(time.time() - t0, 1)} s ; en haut : {haut})')
    verifier(visible(pg, cid), 'et on la voit, en bas')
    b.close()
print('ERREURS', erreurs)
print('ÉCHECS', len(echecs), echecs)
sys.exit(1 if echecs or erreurs else 0)
