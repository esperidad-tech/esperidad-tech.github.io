"""Les habits rigolos de Mimi (mimi-habits.js ; Bible §12.74 ; Romain, 17 novembre : « une vingtaine de nouveaux habits assez originaux
avec des petites animations. Fais attention à ne pas casser les animations de Mimi […] ou à cacher certaines choses un peu trop »),
dans le vrai jeu (Playwright) :
- les données : une vingtaine d'habits, chacun dans la garde-robe et dans une famille de coffrets, une seule ; aucun dans la boutique ;
- la garde-robe : trois endroits (autour du cou, sur la tête, sur le museau) ; on en met un de chaque en même temps ;
- chaque habit, mis au doigt dans la garde-robe : il est sur elle dans la pièce, et il a au moins un morceau QUI BOUGE pour de bon
  (on regarde son dessin changer au fil du temps) — sans toucher au pantin ;
- avec un habit : elle réagit encore au doigt, on la gratte encore, elle marche, elle dort ; son pantin vit toujours ;
- ce qu'elle a sur le museau disparaît quand on la voit de dos ;
- une planche de tous les habits, arrêtés à quatre instants de leur animation (à regarder) ;
- aucun message d'erreur.
   BRUMEVAL_DIST=<dossier construit> python3 tools/mimi-habits.py [iphone]"""
import sys, os, json, time
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html') + '#test'
OUT = os.path.join(ICI, '..', 'test', 'mimi-habits'); os.makedirs(OUT, exist_ok=True)
TEL = 'iphone' in sys.argv
erreurs, echecs = [], []
n = [0]
V = "Atelier._vue()"
CHAT = "M.S.atelier.objets.filter(function(o){ return o.t === 'chat'; })[0]"

def shot(pg, nom):
    n[0] += 1; pg.screenshot(path=f'{OUT}/{"tel-" if TEL else ""}{n[0]:02d}-{nom}.png')

def verifier(cond, quoi):
    print('  ✓' if cond else '  ✗', quoi, flush=True)
    if not cond: echecs.append(quoi)

def debut(b):
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
    pg.evaluate("() => { window.__lus = []; M.lire = function(t){ window.__lus.push(String(t)); }; }")
    pg.evaluate("() => { M.UI.modal = null; M.P().onglet = 'role'; M.render(); }"); pg.wait_for_timeout(1200)
    return pg

def chat(pg, cid): return pg.evaluate(f"() => {V}._chat('{cid}')")
def classes(pg, cid): return pg.evaluate(f"() => {{ var d = document.querySelector('#atelier-ici [data-obj=\"{cid}\"]'); return d ? d.className : ''; }}")
def calme(pg, cid, pose='assis'):
    pg.evaluate(f"() => {{ var a = {V}; a._finJouet(); a._reveil('{cid}'); a._dehors('{cid}'); a._pose('{cid}', '{pose}'); }}"); pg.wait_for_timeout(250)
def point(pg, cid, quoi):
    q = pg.evaluate(f"() => {V}._ptChat('{cid}', '{quoi}')")
    return (q[0], q[1]) if q else None
def voir(pg, oid, dy=60):
    pg.evaluate(f"() => {{ var a = {V}, p = a._pos('{oid}'); if(p) a._voir(p.x, p.y - {dy}); }}"); pg.wait_for_timeout(400)
def sur_chat(pg, cid, quoi, pose='assis'):
    q = None
    for i in range(8):
        calme(pg, cid, pose); voir(pg, cid); pg.wait_for_timeout(900); q = point(pg, cid, quoi)
        if q and pg.evaluate(f"() => {{ var e = document.elementFromPoint({q[0]}, {q[1]}), o = e && e.closest('[data-obj]'); return !!o && o.getAttribute('data-obj') === '{cid}' && !e.closest('.at-bulle'); }}"): return q
    return q
def porte(pg, cid): return pg.evaluate(f"() => {{ var c = M.S.atelier.objets.filter(function(o){{ return o.id === '{cid}'; }})[0]; return c.acc || {{}}; }}")
def mettre(pg, cid, hid):
    """dans la garde-robe, un toucher sur l'habit (le vrai bouton)"""
    pg.evaluate(f"() => {V}._garde('{cid}')"); pg.wait_for_timeout(350)
    ok = pg.evaluate("(id) => { var b = document.querySelector('#atelier-ici .at-f-garde [data-acc=\"' + id + '\"]'); if(!b) return false; b.scrollIntoView({block:'center'}); b.dispatchEvent(new MouseEvent('click', {bubbles:true})); return true; }", hid)
    pg.wait_for_timeout(300)
    return ok
def fermer(pg):
    pg.evaluate("() => { var g = document.querySelector('#atelier-ici .at-grim .at-fermer'); if(g) g.click(); }"); pg.wait_for_timeout(350)

# ce qui bouge dans un habit : pour chaque morceau animé, combien de dessins différents en deux tours de son animation
BOUGE = """(id) => new Promise(function(fin){
  var g = document.querySelector('#atelier-ici .at-piece [data-habit="' + id + '"]') || document.querySelector('#atelier-ici [data-obj] [data-habit="' + id + '"]');
  if(!g){ fin(null); return; }
  var l = [].slice.call(g.querySelectorAll('[class^="mi-h-"]')), vus = l.map(function(){ return {}; }), t0 = performance.now(), duree = 0;
  l.forEach(function(e){ var cs = getComputedStyle(e); duree = Math.max(duree, parseFloat(cs.animationDuration) || 0); });
  (function tic(){
    l.forEach(function(e, i){ var cs = getComputedStyle(e); vus[i][cs.transform + '/' + (Math.round(parseFloat(cs.opacity) * 10) / 10)] = 1; });
    if(performance.now() - t0 > Math.min(7, duree * 1.25 + 0.4) * 1000){ fin({n:l.length, cls:l.map(function(e){ return e.getAttribute('class'); }), anim:l.map(function(e){ return getComputedStyle(e).animationName; }), vus:vus.map(function(v){ return Object.keys(v).length; }), pantin:g.querySelectorAll('[class^="mi-h-"] [data-m], [class^="mi-h-"][data-m]').length}); return; }
    setTimeout(tic, 70);
  })();
})"""

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

    # --- les données ---
    D = pg.evaluate(f"""() => {{ var H = MimiPantin.HABITS, A = Atelier.ACCESSOIRES, f = {V}._familles().reste, ids = Object.keys(H);
      return {{ids:ids, slots:ids.map(function(i){{ return H[i].slot; }}), acc:ids.filter(function(i){{ return A[i] && A[i].slot === H[i].slot && A[i].nom === H[i].nom; }}).length, total:Object.keys(A).length,
        fam:ids.map(function(i){{ return Object.keys(f).filter(function(k){{ return f[k].indexOf('a:' + i) >= 0; }}); }}), familles:Object.keys(f), art:ids.map(function(i){{ return H[i].art; }}),
        vides:ids.filter(function(i){{ return MimiPantin.habit(i).length < 200; }})}}; }}""")
    ids = D['ids']
    print('   habits :', len(ids), '—', ', '.join(ids)); print('   familles :', D['familles'])
    verifier(18 <= len(ids) <= 24, f'une vingtaine d\'habits rigolos ({len(ids)})')
    verifier(set(D['slots']) == {'cou', 'tete', 'nez'}, f'trois endroits : le cou ({D["slots"].count("cou")}), la tête ({D["slots"].count("tete")}), le museau ({D["slots"].count("nez")})')
    verifier(D['acc'] == len(ids) and not D['vides'], f'chacun est dans la garde-robe du jeu, avec son dessin ({D["acc"]} ; {D["total"]} habits en tout)')
    verifier(all(len(x) == 1 for x in D['fam']), f'chacun est dans une famille de coffrets, une seule ({sorted(set(sum(D["fam"], [])))})')
    verifier(all(a and a.split(' ')[0] in ('un', 'une', 'des') for a in D['art']), 'chacun a son nom avec son article, pour le conteur')

    # --- la boutique : pas un seul habit ---
    pg.evaluate("() => { M.S.or = 30; M.sauver(); }")
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici .at-mimi-bt'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(400)
    pg.evaluate("() => { var b = document.querySelector('#atelier-ici [data-mimi=shop]'); if(b) b.dispatchEvent(new MouseEvent('click', {bubbles:true})); }"); pg.wait_for_timeout(500)
    bq = pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-f-boutique'); return f ? {hab:f.querySelectorAll('[data-achat^=\"h:\"]').length, titres:[].map.call(f.querySelectorAll('.at-ach-g > b'), function(b){ return b.textContent; }), txt:f.querySelector('.at-feuille-txt').textContent} : null; }")
    verifier(bq is not None and bq['hab'] == 0 and 'Ses habits' not in bq['titres'], f'la boutique : plus un seul habit ({bq and bq["titres"]})')
    shot(pg, 'boutique'); fermer(pg)

    # --- un coffret : un habit rigolo en sort, le conteur le dit bien ---
    calme(pg, cid)
    pg.evaluate(f"() => {{ var a = {V}; a._cadeau('{cid}', 'a:grenouille'); }}")
    t0 = time.time()
    while time.time() - t0 < 36 and not pg.evaluate("() => !!M.S.atelier.tama.coffret"): pg.wait_for_timeout(500)
    pg.wait_for_timeout(600)
    pg.evaluate(f"() => {{ var c = M.S.atelier.tama.coffret; if(c) {V}._voir(c.x, c.y); }}"); pg.wait_for_timeout(500)
    cq = pg.evaluate("() => { var e = document.querySelector('#atelier-ici .at-coffret svg'); if(!e) return null; var r = e.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height * .6}; }")
    if cq:
        pg.mouse.move(cq['x'], cq['y']); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(800)
        t = pg.evaluate("() => { var t = document.querySelector('#atelier-ici .at-toast'); return t && !t.hidden ? t.textContent : ''; }").replace('\u00a0', ' ')      # (le jeu met une espace insécable devant « ! »)
        print('   le conteur :', t)
        verifier('grenouille' in pg.evaluate("() => M.S.atelier.garde.a") and 'une grenouille qui se prend pour un chapeau ! Elle attend dans sa garde-robe' in t, 'un coffret donne un habit rigolo ; le conteur : « une grenouille qui se prend pour un chapeau ! Elle attend dans sa garde-robe »')
        shot(pg, 'coffret-grenouille'); pg.wait_for_timeout(1500)
    else: verifier(False, 'le coffret arrive')

    # --- la garde-robe : trois endroits ; tout y est quand on a tout ---
    pg.evaluate("() => { M.S.atelier.garde.a = Object.keys(Atelier.ACCESSOIRES); M.S.atelier.garde.neuf = []; }")
    calme(pg, cid); voir(pg, cid)
    pg.evaluate(f"() => {V}._garde('{cid}')"); pg.wait_for_timeout(500)
    g = pg.evaluate("() => { var f = document.querySelector('#atelier-ici .at-f-garde'); return {rangs:[].map.call(f.querySelectorAll('.at-garde-slot > b'), function(b){ return b.textContent; }), n:f.querySelectorAll('[data-acc]:not([data-acc=\"\"])').length, petits:[].map.call(f.querySelectorAll('[data-acc]'), function(b){ var r = b.getBoundingClientRect(); return Math.min(r.width, r.height); })}; }")
    verifier(g['rangs'][-3:] == ['Autour du cou', 'Sur la tête', 'Sur le museau'], f'la garde-robe : trois endroits ({g["rangs"]})')
    verifier(g['n'] == D['total'] and min(g['petits']) >= 48, f'tous les habits y sont ({g["n"]}), des boutons d\'au moins 48 points ({round(min(g["petits"]))})')
    shot(pg, 'garde-robe-haut')
    pg.evaluate("() => { var l = document.querySelectorAll('#atelier-ici .at-f-garde .at-garde-slot'); l[l.length - 2].scrollIntoView({block:'start'}); }"); pg.wait_for_timeout(300)
    shot(pg, 'garde-robe-tete')
    pg.evaluate("() => { var l = document.querySelectorAll('#atelier-ici .at-f-garde .at-garde-slot'); l[l.length - 1].scrollIntoView({block:'end'}); }"); pg.wait_for_timeout(300)
    shot(pg, 'garde-robe-museau')
    fermer(pg)

    # --- chaque habit : mis au doigt, il est sur elle, et il bouge ---
    immobiles, absents, touche_pantin = [], [], []
    for hid in ids:
        calme(pg, cid)
        ok = mettre(pg, cid, hid); fermer(pg)
        a = porte(pg, cid); sl = D['slots'][ids.index(hid)]
        r = pg.evaluate(BOUGE, hid)
        if not ok or a.get(sl) != hid or r is None: absents.append(hid); print('   ✗', hid, ok, a, r); continue
        bouge = all(v >= 2 for v in r['vus']) and all(x != 'none' for x in r['anim'])      # (chaque morceau animé a au moins deux dessins : les lampions clignotent, les autres bougent)
        if not bouge: immobiles.append(hid)
        if r['pantin']: touche_pantin.append(hid)
        print(f'   {hid} : {r["n"]} morceau(x) animé(s) {r["cls"]}, dessins différents vus : {r["vus"]}', flush=True)
    verifier(not absents, f'chaque habit, touché dans la garde-robe, est sur elle dans la pièce ({absents or "tous"})')
    verifier(not immobiles, f'chaque habit a une petite animation qui bouge pour de bon ({immobiles or "tous"})')
    verifier(not touche_pantin, f'aucune animation d\'habit ne touche un morceau du pantin ({touche_pantin or "aucune"})')

    # --- les trois à la fois ; elle vit toujours ---
    for hid in ('hautdeforme', 'medaille', 'lunettes'):
        mettre(pg, cid, hid); fermer(pg)
    a = porte(pg, cid)
    verifier(a == {'tete': 'hautdeforme', 'cou': 'medaille', 'nez': 'lunettes'}, f'un sur la tête, un au cou, un sur le museau, en même temps ({a})')
    q = sur_chat(pg, cid, 'dos')
    shot(pg, 'trois-habits')
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(60); pg.mouse.up(); pg.wait_for_timeout(500)
    c = chat(pg, cid)
    verifier(c['reac'] is not None, f'habillée, un toucher : elle réagit ({c["reac"]})')
    pg.wait_for_timeout(2200)
    q = sur_chat(pg, cid, 'tete')
    pg.mouse.move(*q); pg.mouse.down(); pg.wait_for_timeout(1400)
    c = chat(pg, cid); cl = classes(pg, cid)
    pg.mouse.up(); pg.wait_for_timeout(400)
    verifier(c['caresse'] == 'tete' and 'at-c-ronron' in cl, f'habillée, le doigt sur la tête (sur ses lunettes) : elle ronronne ({c["caresse"]})')
    pt = pg.evaluate(f"() => {V}._pantin('{cid}')")
    verifier(pt is not None, f'son pantin vit toujours ({pt and pt["nom"]})')
    # (de dos : ses lunettes ne se voient plus ; de face, si)
    calme(pg, cid); voir(pg, cid)
    FACE = f"() => {{ var g = document.querySelector('#atelier-ici [data-obj=\"{cid}\"] [data-habit=lunettes] [data-m=\"face:v\"]'); return g ? getComputedStyle(g).display : null; }}"
    devant = pg.evaluate(FACE)
    p0 = pg.evaluate(f"() => {V}._pos('{cid}')")
    pg.evaluate(f"() => {V}._va('{cid}', {p0['x']}, {p0['y'] - 190})")
    vues, dos = [], None
    for i in range(24):
        pg.wait_for_timeout(120); pt = pg.evaluate(f"() => {V}._pantin('{cid}')"); vues.append(pt['vue'] if pt else None)
        if pt and pt['vue'] in ('dos', 'tqd', 'tqg'):
            d = pg.evaluate(FACE)
            if pt['vue'] == 'dos': dos = d; shot(pg, 'de-dos'); break
    print('   ses vues en s\'éloignant :', sorted(set(v for v in vues if v)))
    verifier(devant != 'none' and dos == 'none', f'ses lunettes : de face on les voit ({devant}), de dos non ({dos})')
    pg.wait_for_timeout(1500)

    # --- endormie avec un grand chapeau : rien ne casse ---
    pg.evaluate(f"() => {V}._pose('{cid}', 'dort')"); pg.wait_for_timeout(900); voir(pg, cid); shot(pg, 'dort-habillee')
    verifier('at-c-dort' in classes(pg, cid) and pg.evaluate(f"() => !!document.querySelector('#atelier-ici [data-obj=\"{cid}\"] [data-habit=hautdeforme]')"), 'endormie, elle garde son chapeau')

    # --- la planche à regarder : tous les habits, arrêtés à quatre instants de leur animation ---
    for k, f in enumerate((0.0, 0.66, 0.72, 0.86)):
        pg.evaluate("""(f) => { var o = document.getElementById('pl-habits'); if(o) o.remove(); o = document.createElement('div'); o.id = 'pl-habits';
          o.style.cssText = 'position:fixed;inset:0;z-index:99999;background:#4a3c6a;display:flex;flex-wrap:wrap;align-content:flex-start;overflow:hidden';
          var H = MimiPantin.HABITS, w = Math.floor(innerWidth / (innerWidth < 600 ? 4 : 7));
          o.innerHTML = Object.keys(H).map(function(id){ var a = {}; a[H[id].slot] = id;
            return '<div style="width:' + w + 'px;height:' + Math.round(w * 1.06) + 'px;position:relative;overflow:hidden;outline:1px solid #3a2f55"><div style="position:absolute;left:0;top:0;width:' + w + 'px;height:' + Math.round(w * 1.06) + 'px"><svg viewBox="-34 -50 68 76" width="' + w + '" height="' + Math.round(w * 1.06) + '">' + MimiPantin.tete(0, {cou:H[id].slot === 'cou' ? MimiPantin.habit(id) : '', tete:H[id].slot === 'cou' ? '' : MimiPantin.habit(id)}) + '</svg></div><small style="position:absolute;left:3px;top:1px;color:#fff;font:11px sans-serif">' + id + '</small></div>'; }).join('');
          document.body.appendChild(o);
          [].forEach.call(o.querySelectorAll('[class^="mi-h-"]'), function(e){ var d = parseFloat(getComputedStyle(e).animationDuration) || 1; e.style.animationDelay = (-d * f) + 's'; e.style.animationPlayState = 'paused'; }); }""", f)
        pg.wait_for_timeout(350); shot(pg, f'planche-{int(f * 100):02d}')
    pg.evaluate("() => { var o = document.getElementById('pl-habits'); if(o) o.remove(); }")
    print('ERREURS :', erreurs[:6])
    verifier(not erreurs, 'aucun message d\'erreur')
    b.close()
print(f'\n{len(echecs)} échec(s)' + (' : ' + ' | '.join(echecs) if echecs else ''))
sys.exit(1 if echecs else 0)
