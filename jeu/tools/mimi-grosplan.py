"""Le gros plan de Mimi (Bible §12.67 et §12.76 ; Romain, 16 novembre, 20 h 00 → 20 h 14 : « de temps en temps, le chat, il descend et il
sort un peu de l'écran par en bas. Et là, on le voit grimper et on le voit à plein écran […] on peut lui caresser sa tête […] Elle pourrait
aussi lécher un peu l'écran […] Ou alors on clique dessus. Et là, elle redescend direct »), dans le vrai jeu, AU DOIGT (Playwright) :
- elle descend tout en bas, sort par le bas de l'écran, disparaît de la pièce ;
- la grosse tête arrive : une patte, l'autre, elle glisse, les oreilles, la tête ; les boutons du bas se cachent, l'appareil photo monte ;
- on la caresse (un vrai doigt qui frotte sa tête) : les yeux fermés, elle ronronne, penche la tête contre le doigt (des deux côtés),
  des cœurs, du bonheur ; elle lèche l'écran (la langue, une trace mouillée) ;
- on la laisse : elle repart toute seule, et revient dans la pièce, de dos ;
- un simple toucher : elle repart tout de suite ;
- la photo : « Le gros plan » dans l'album, la plus rare, et son cadeau à part (des yeux vairons) ; une deuxième : « Dommage, c'était la même » ;
- de temps en temps, toute seule (tama.grosT) ;
- des captures de chaque moment (à regarder) ; aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-grosplan.py [iphone]"""
import sys, os, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi-grosplan'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
n = [0]
V = "Atelier._vue()"
CHAT = "M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0]"

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def shot(pg, nom):
    n[0] += 1; pg.screenshot(path=f'{OUT}/{"tel-" if TEL else ""}{n[0]:02d}-{nom}.png')

def debut(b):
    vp = {'width': 390, 'height': 844} if TEL else {'width': 1180, 'height': 820}
    pg = b.new_context(viewport=vp, has_touch=True, device_scale_factor=2).new_page()
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
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    return pg

def classes(pg, cid): return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); return d ? d.className : ''; }}")
def calme(pg, cid, pose='assis'):
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', '{pose}'); }}"); pg.wait_for_timeout(250)
def etat(pg): return pg.evaluate(f"() => {V}._grosEtat()")
def attendre(pg, f, s):
    t0 = time.time()
    while time.time() - t0 < s:
        if f(): return round(time.time() - t0, 1)
        pg.wait_for_timeout(100)
    return None
def cadre(pg, sel):
    return pg.evaluate("(s) => { var d = document.querySelector(s); if(!d) return null; var r = d.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; }", sel)
def tete(pg):
    """le milieu du front de sa grosse tête, à l'écran (là où on caresse)"""
    return pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-gp [data-g=\"tete\"]'); if(!t) return null; var r = t.getBoundingClientRect(); return [r.left + r.width / 2, r.top + r.height * 0.3, r.width, r.height]; }")
def visible(pg, sel):
    return pg.evaluate("(s) => { var d = document.querySelector(s); if(!d) return false; var c = getComputedStyle(d); var r = d.getBoundingClientRect(); return c.visibility !== 'hidden' && c.display !== 'none' && r.width > 0; }", sel)
def jusqua(pg, phase, s=14):
    return attendre(pg, lambda: (etat(pg) or {}).get('phase') == phase, s)
def lancer(pg, cid):
    calme(pg, cid)
    ok = pg.evaluate(f"() => {V}._gros()")
    return ok

with sync_playwright() as p:
    b = p.chromium.launch()
    pg = debut(b)
    for i in range(90):
        if not pg.evaluate("() => { var k = document.querySelector('#atelier-ici .at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; }"): break
        pg.wait_for_timeout(260)
        pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }")
    pg.evaluate(f"() => {{ var a = {V}; if(a._salle() !== 0) a._allerSalle(0); }}"); pg.wait_for_timeout(600)
    cid = pg.evaluate(f"() => ({CHAT} || {{}}).id || null")
    verifier(cid is not None, 'Mimi est dans l\'atelier')
    pg.evaluate("() => { var m = M.S.atelier.mimi; m.album = []; m.peaux = {p:[], y:[]}; }")

    # --- 1. elle descend, et sort par le bas de l'écran ---
    verifier(lancer(pg, cid), 'le gros plan démarre (_gros)')
    # (ses réglages, relevés dans la page à chaque image : le robot, lui, ne regarde que de temps en temps)
    pg.evaluate(f"() => {{ window.__gros = []; var a = {V}, t0 = performance.now(); (function f(){{ var e = a._grosEtat(); if(e && e.E) window.__gros.push([performance.now() - t0, e.phase, e.E]); if(performance.now() - t0 < 30000) requestAnimationFrame(f); }})(); }}")
    e = etat(pg); verifier(e['phase'] in ('va', 'saute'), f'elle descend tout en bas ({e["phase"]})')
    t = jusqua(pg, 'saute', 12)
    verifier(t is not None, f'elle arrive en bas… ({t} s)')
    pg.wait_for_timeout(200); shot(pg, 'saute')
    t = jusqua(pg, 'monte', 6)
    verifier(t is not None, f'… et disparaît par le bas ({t} s)')
    t0 = time.time()
    verifier('at-c-dehors' in classes(pg, cid), 'dans la pièce, on ne la voit plus')
    verifier(pg.locator('#atelier-ici .at-gp .at-gp-svg').count() == 1, 'la grosse tête est là (un dessin à part)')
    verifier(pg.evaluate("() => !!document.querySelector('.at-gp-actif')"), 'l\'atelier le sait (at-gp-actif)')
    verifier(not visible(pg, '#atelier-ici .at-mimi-bt') and not visible(pg, '#atelier-ici .at-salle') and not visible(pg, '#atelier-ici .at-coin'), 'les boutons du bas se cachent (🛏️ 🐾 📦)')
    ph = cadre(pg, '#atelier-ici .at-photo-bt'); vp = pg.viewport_size
    verifier(ph is not None and visible(pg, '#atelier-ici .at-photo-bt') and ph[0] > vp['width'] * 0.6, f'l\'appareil photo est là, monté à droite ({ph})')
    # la montée, image par image (à regarder) ; ses réglages relevés tout du long
    moments = [(0.75, 'une-patte'), (1.4, 'deux-pattes'), (2.05, 'elle-glisse'), (3.35, 'les-oreilles'), (4.45, 'ca-pousse'), (6.2, 'elle-regarde'), (8.3, 'la-tete-penchee')]
    vus, mi = {}, 0
    while time.time() - t0 < 9.2:
        s = time.time() - t0
        if mi < len(moments) and s >= moments[mi][0]:
            shot(pg, 'monte-' + moments[mi][1]); vus[moments[mi][1]] = etat(pg)['E']; mi += 1
        pg.wait_for_timeout(25)
    rel = pg.evaluate("() => window.__gros")
    m0 = next((q[0] for q in rel if q[1] == 'monte'), 0)
    suite = [((q[0] - m0) / 1000, q[2]) for q in rel if q[1] in ('monte', 'la')]
    print('   (', len(suite), 'images relevées pendant la montée )')
    def entre(a, b, k): return [E[k] for (s, E) in suite if a <= s <= b]
    verifier(any(E['monte'] < 0.05 and E['patG'] < 12 and E['patD'] > 20 for (q, E) in suite if 0.4 <= q <= 1.1), 'une patte s\'accroche au bord, puis l\'autre ; rien d\'autre')
    verifier(max(entre(1.5, 2.9, 'patG')) > 4, f'elle glisse ! ({round(max(entre(1.5, 2.9, "patG")), 1)})')
    verifier(any(0.12 < m < 0.28 for m in entre(2.9, 4.2, 'monte')), 'd\'abord ses oreilles')
    mx = max(entre(4.0, 4.9, 'monte')); apres = [m for (s, E) in suite for m in [E['monte']] if 4.4 <= s <= 5.2]
    verifier(mx > 0.48 and min(apres) < mx - 0.04, f'elle pousse… et retombe un peu ({round(mx, 2)} → {round(min(apres), 2)})')
    verifier(max(entre(5.5, 9.2, 'monte')) > 0.97 and min(entre(5.6, 7.8, 'lx')) < -0.5 and max(entre(5.6, 7.8, 'lx')) > 0.5, 'puis toute sa tête : elle regarde partout, à gauche, à droite')
    verifier(max(entre(7.8, 9.2, 'tilt')) > 5, f'puis nous, la tête penchée ({round(max(entre(7.8, 9.2, "tilt")), 1)}°)')
    verifier(max(entre(7.8, 9.2, 'pau')) > 0.5, 'un clignement')
    tt = tete(pg); print('   (sa tête à l\'écran :', [round(x) for x in tt], ')')
    verifier(tt[3] > vp['height'] * (0.35 if TEL else 0.55), f'en grand : sa tête prend {round(tt[3] / vp["height"] * 100)} % de la hauteur')
    t = jusqua(pg, 'la', 3); verifier(t is not None, 'elle attend')

    # --- 2. on la caresse, au doigt : à droite, puis à gauche ---
    x, y, w, h = tt
    pg.mouse.move(x, y); pg.mouse.down()
    t1 = time.time(); tilts = []
    while time.time() - t1 < 3.4:
        k = (time.time() - t1)
        cx = x + (w * 0.18 if k < 1.7 else -w * 0.18) + (w * 0.06 if int(k * 6) % 2 else -w * 0.06)
        pg.mouse.move(cx, y + (h * 0.04 if int(k * 5) % 2 else -h * 0.04), steps=3); pg.wait_for_timeout(40)
        e = etat(pg)['E']; tilts.append(e['tilt'])
        if 1.2 < k < 1.35 and not vus.get('car'): shot(pg, 'caresse-droite'); vus['car'] = 1
    e = etat(pg)
    shot(pg, 'caresse-gauche')
    verifier(e['E']['clos'] > 0.8 and e['E']['ronron'] > 0.5, f'on la caresse : elle ferme les yeux, elle ronronne ({round(e["E"]["clos"], 2)}, {round(e["E"]["ronron"], 2)})')
    verifier(max(tilts) > 5 and min(tilts) < -5, f'elle penche la tête contre le doigt, d\'un côté puis de l\'autre ({round(max(tilts), 1)}°, {round(min(tilts), 1)}°)')
    verifier(e['gain'] > 2, f'du bonheur ({e["gain"]})')
    verifier(e['lech'], 'elle lèche l\'écran')
    lech = pg.evaluate("() => ({l:document.querySelectorAll('#atelier-ici .at-gp-lech').length, c:document.querySelectorAll('#atelier-ici .at-gp-coeur').length})")
    verifier(lech['c'] > 0, f'des cœurs ({lech["c"]})')
    verifier(lech['l'] > 0, 'une trace mouillée sur l\'écran')
    # (la langue : on attend le prochain coup de langue pour la voir)
    attendre(pg, lambda: etat(pg)['E']['langue'] > 0.6, 7); pg.mouse.move(x + 3, y); shot(pg, 'langue')
    verifier(pg.evaluate("() => [].some.call(document.querySelectorAll('#atelier-ici .at-gp-mot'), function(m){ return /Slurp/.test(m.textContent); })"), '« Slurp ! »')
    pg.mouse.up()
    # --- 3. on la laisse : elle repart toute seule, et revient de dos ---
    t2 = time.time()
    t = jusqua(pg, 'part', 9)
    verifier(t is not None and 3.5 < t < 7.5, f'on la laisse : elle repart toute seule ({t} s après la dernière caresse)')
    pg.wait_for_timeout(250); shot(pg, 'elle-regarde-en-bas')
    t = attendre(pg, lambda: pg.locator('#atelier-ici .at-gp').count() == 0, 4)
    verifier(t is not None, 'la grosse tête s\'en va')
    verifier(attendre(pg, lambda: 'at-c-dehors' not in classes(pg, cid), 4) is not None, 'elle revient dans la pièce')
    pg.wait_for_timeout(500)
    pa = pg.evaluate(f"() => {V}._pantin('{cid}')"); shot(pg, 'retour-de-dos')
    print('   (au retour :', pa, ')')
    verifier(pa and pa['marche'] and pa['vue'] in ('dos', 'tqd'), f'elle repart dans la pièce, de dos ({pa and pa["vue"]})')
    verifier(visible(pg, '#atelier-ici .at-mimi-bt') and not pg.evaluate("() => !!document.querySelector('#atelier-ici .at-gp-actif')"), 'les boutons du bas reviennent')
    e = etat(pg); verifier(e['phase'] is None and e['t'] >= e['jeu'] + 700, f'la prochaine fois : dans 12 à 18 minutes de jeu ({round((e["t"] - e["jeu"]) / 60, 1)} min)')
    attendre(pg, lambda: not pg.evaluate(f"() => {V}._chat('{cid}').anim"), 8)
    verifier(pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); var r = d.getBoundingClientRect(); return getComputedStyle(d).visibility !== 'hidden' && r.width > 20 && Number(getComputedStyle(d).opacity) > 0.9; }}"), 'on la voit bien (pas effacée)')

    # --- 4. un simple toucher : elle repart tout de suite ---
    pg.wait_for_timeout(800)
    verifier(lancer(pg, cid), 'une autre fois')
    jusqua(pg, 'la', 25)
    tt = tete(pg)
    pg.mouse.click(tt[0], tt[1])
    t = jusqua(pg, 'part', 2)
    verifier(t is not None and t < 0.6, f'un simple toucher : elle repart tout de suite ({t} s)')
    attendre(pg, lambda: (etat(pg) or {}).get('phase') is None, 6)

    # --- 5. la photo : la plus rare, et son cadeau à part ---
    pg.wait_for_timeout(800)
    verifier(lancer(pg, cid), 'une troisième fois')
    jusqua(pg, 'la', 25)
    pg.locator('#atelier-ici .at-photo-bt').click(); pg.wait_for_timeout(600)
    m = pg.evaluate(f"() => {V}._mimi()")
    tx = pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }")
    shot(pg, 'photo')
    verifier([f['k'] for f in m['mimi']['album']] == ['gros'], f'la photo : « Le gros plan » dans l\'album ({tx[:90]})')
    verifier('rare' in tx and 'Vairons' in tx and 5 in m['mimi']['peaux']['y'], 'la plus rare de toutes, et son cadeau à part : des yeux vairons')
    pg.wait_for_timeout(1500)
    pg.locator('#atelier-ici .at-photo-bt').click(); pg.wait_for_timeout(500)
    tx = pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }").replace(' ', ' ')
    verifier('la même' in tx, f'une deuxième : « Dommage, c\'était la même ! » ({tx[:60]})')
    attendre(pg, lambda: (etat(pg) or {}).get('phase') is None, 14)
    pg.wait_for_timeout(600)
    # l'album
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-barre [data-mimi=\"album\"]'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(600)
    verifier(pg.locator('#atelier-ici .at-photo-gp svg').count() == 1, 'dans l\'album : sa grosse tête')
    shot(pg, 'album')
    pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-cal-album .at-fermer, #atelier-ici .at-grim .at-fermer'); if(f) f.click(); }"); pg.wait_for_timeout(400)
    pg.evaluate("() => { var c = document.querySelector('#atelier-ici .at-calque [data-ferme], #atelier-ici .at-calque .at-fermer'); if(c) c.click(); }"); pg.wait_for_timeout(300)
    # ses yeux vairons, dans la pièce et en gros plan
    pg.evaluate(f"() => {{ var o = {CHAT}; o.v = (o.v % 100) + 100 * 6; Atelier._vue()._humeur(); }}")

    # --- 6. de temps en temps, toute seule ---
    pg.keyboard.press('Escape'); pg.wait_for_timeout(300)
    calme(pg, cid)
    verifier(pg.evaluate("() => { var t = M.S.atelier.tama; t.grosT = 1; return true; }"), 'c\'est l\'heure (tama.grosT)')
    pg.wait_for_timeout(16000)
    verifier((etat(pg) or {}).get('phase') is None, 'pas pendant les parties des robots (navigator.webdriver)')
    pg.evaluate("() => { window.BRUMEVAL_GROS_AUTO = true; }")
    t = attendre(pg, lambda: (etat(pg) or {}).get('phase') is not None, 20)
    verifier(t is not None, f'de temps en temps, elle vient toute seule (au tic suivant : {t} s)')
    jusqua(pg, 'la', 25); pg.wait_for_timeout(400)
    shot(pg, 'vairons')
    attendre(pg, lambda: (etat(pg) or {}).get('phase') is None, 16)

    verifier(not erreurs, f'aucun message d\'erreur ({erreurs[:3]})')
    b.close()
print()
print(f'{len(echecs)} échec(s)' + (' : ' + ' ; '.join(echecs) if echecs else ''))
sys.exit(1 if echecs or erreurs else 0)
