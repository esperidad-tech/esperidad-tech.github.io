"""Banc d'essai des « Bulles magiques » v2 (src/mj-bulles.js), dans la salle d'entraînement.
Usage : python3 test/bulles/essai.py   (construit le jeu, puis teste une copie de la salle)
  1. robot parfait : gagne les 4 manches (niveau 10, par les vrais boutons de la salle) ;
     pendant ce temps : aucune bulle ne saute (écart image par image), vitesse constante,
     et une bulle ne change de direction QUE contre un bord ou une autre bulle ;
  2. robot qui fait 2 erreurs sur la 5e bulle de la manche 3 : reste sur la même bulle, sans
     revoir la suite, puis trouve la bonne et gagne avec 1 vie ;
  3. robot qui fait 3 erreurs : perd (fin reussi:false) ;
  4. aides : eclate, aide (bouton 💡), zone, lent ;
  5. contrat : fin appelée une seule fois ; après arreter() plus rien ne bouge et fin n'est jamais appelée ;
  6. aucune erreur console à 390×844, 800×1280 et 1280×800 ;
  7. planche-contact test/bulles/planche-bulles.png.
"""
import os, sys, time, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

import shutil, subprocess
ICI = os.path.dirname(os.path.abspath(__file__))
RACINE = os.path.abspath(os.path.join(ICI, '..', '..'))
# dist/ est partagé avec d'autres chantiers : on construit puis on garde AUSSITÔT une copie à nous
_env = dict(os.environ); _env.pop('BRUMEVAL_SANS', None)
subprocess.run([sys.executable, os.path.join(RACINE, 'build.py')], check=True, env=_env, stdout=subprocess.DEVNULL)
COPIE = os.path.join(ICI, 'salle-bulles.html')
shutil.copyfile(os.path.join(RACINE, 'dist', 'salle-mini-jeux.html'), COPIE)
assert '/* ===== mj-bulles.js ===== */\n/* ====' in open(COPIE, encoding='utf-8').read(), 'mj-bulles.js absent de la salle'
URL = 'file://' + COPIE
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
TAILLES = [(390, 844), (800, 1280), (1280, 800)]
bilan = {'ok': True, 'tests': {}}

def note(nom, ok, info=None):
    bilan['tests'][nom] = {'ok': bool(ok), 'info': info}
    if not ok: bilan['ok'] = False
    print(('OK   ' if ok else 'ÉCHEC') + ' ' + nom + ('  ' + json.dumps(info, ensure_ascii=False) if info is not None else ''))

EMBALLER = """() => {
  window.__finJeu = 0; window.__resJeu = null; window.__finCoeur = 0;
  const def = MJ.TYPES.bulles;
  if(!def.__emballe){
    const orig = def.jouer;
    def.jouer = function(el, p, fin){ window.__h = null; const r = orig.call(this, el, p, function(res){ window.__finJeu++; window.__resJeu = res; fin(res); }); window.__h = window.__bulles; return r; };
    def.__emballe = true;
  }
}"""
LANCER = """([niveau, mods]) => {
  const plein = document.getElementById('sl-plein');
  plein.innerHTML = '<button class="sl-quitter">← Retour à la salle</button><div class="sl-cadre"></div>'; plein.hidden = false; document.body.classList.add('sl-bloque');
  const params = MJ.reglages('bulles', niveau, mods);
  window.__params = params;
  window.__partie = MJ.lancer(plein.querySelector('.sl-cadre'), 'bulles', params, r => { window.__finCoeur++; }, {aides:[]});
}"""
ETAT = """() => { const h = window.__bulles; if(!h) return null;
  return {phase:h.phase, manche:h.manche, pas:h.pas, vies:h.vies, att:h.attendu(), fautes:h.fautes, aides:h.aides,
          actives:h.bulles().filter(b => b.etat === 'ok').map(b => b.i), nj:h.journal.length}; }"""
ECHANTILLON = """() => {
  const S = window.__saut = {max:0, frames:0, vMin:1e9, vMax:0, virages:0, suspects:[], fin:false};
  let prec = null, precB = null;
  function pas(){
    const h = window.__bulles;
    if(!h){ S.fin = true; return; }
    const els = [...document.querySelectorAll('.mjbu-svg .mjbu-bulle')];
    const cur = els.map(e => { if(e.style.display === 'none') return null; const r = e.querySelector('.mjbu-disque').getBoundingClientRect(); return r.width ? {x:r.x + r.width / 2, y:r.y + r.height / 2} : null; });
    if(prec) cur.forEach((c, i) => { if(c && prec[i]){ const d = Math.hypot(c.x - prec[i].x, c.y - prec[i].y); if(d > S.max) S.max = d; } });
    const B = h.bulles(), A = h.arene(), ref = h.params.vitesse;
    if(precB) B.forEach((b, i) => {
      const p = precB[i]; if(b.etat !== 'ok' || p.etat !== 'ok') return;
      const v = Math.hypot(b.vx, b.vy); S.vMin = Math.min(S.vMin, v / ref); S.vMax = Math.max(S.vMax, v / ref);
      const cos = (b.vx * p.vx + b.vy * p.vy) / (v * Math.hypot(p.vx, p.vy));
      if(cos < 0.99999){
        S.virages++;
        const mur = b.x - b.r < A.x0 + 2 || b.x + b.r > A.x1 - 2 || b.y - b.r < A.y0 + 2 || b.y + b.r > A.y1 - 2;
        const voisin = B.some(o => o.i !== b.i && o.etat === 'ok' && Math.hypot(o.x - b.x, o.y - b.y) < o.r + b.r + 6);
        if(!mur && !voisin) S.suspects.push({i:b.i, x:b.x, y:b.y});
      }
    });
    prec = cur; precB = B; S.frames++;
    requestAnimationFrame(pas);
  }
  requestAnimationFrame(pas);
}"""

def nouvelle_page(nav, w, h):
    ctx = nav.new_context(viewport={'width': w, 'height': h}, has_touch=True, device_scale_factor=1)
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.abort())
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.abort())
    page = ctx.new_page()
    page.erreurs = []
    page.on('console', lambda m: page.erreurs.append(m.text) if m.type == 'error' and 'fonts.g' not in (m.location or {}).get('url', '') and 'net::ERR_FAILED' not in m.text else None)
    page.on('pageerror', lambda e: page.erreurs.append(str(e)))
    page.goto(URL, wait_until='domcontentloaded')
    page.wait_for_timeout(200)
    page.evaluate(EMBALLER)
    return ctx, page

def par_la_salle(page, niveau=10):
    page.click(f'[data-niv="{niveau}"]')
    page.evaluate(EMBALLER)
    page.click('[data-jeu="bulles"]')
    page.wait_for_timeout(400)
    page.click('.mj-go')

def lancer(page, niveau=10, mods=None, intro=False):
    page.evaluate(LANCER, [niveau, mods or {}])
    page.wait_for_timeout(300)
    if not intro: page.click('.mj-go')

def etat(page): return page.evaluate(ETAT)
def fini(page): return page.evaluate("!!document.querySelector('.mj-resultat')")
def taper(page, i, touch=False):
    pos = page.evaluate("i => window.__bulles.ecran(i)", i)
    if touch: page.touchscreen.tap(pos['x'], pos['y'])
    else: page.mouse.click(pos['x'], pos['y'])
    return pos

def attendre_phase(page, phase, limite=20):
    t0 = time.time()
    while time.time() - t0 < limite:
        e = etat(page)
        if e and e['phase'] == phase: return e
        if fini(page): return None
        page.wait_for_timeout(30)
    return None

def robot(page, plan=None, delai=230, touch=False, limite=150):
    """Joue jusqu'à l'écran de résultat. plan = {(manche, pas): nombre d'erreurs à faire avant la bonne bulle}."""
    plan = dict(plan or {}); faits = {}; trace = []
    t0 = time.time()
    while time.time() - t0 < limite:
        if fini(page): return trace
        e = etat(page)
        if not e or e['phase'] != 'joue': page.wait_for_timeout(35); continue
        cle = (e['manche'], e['pas'])
        if plan.get(cle, 0) > 0:
            deja = faits.setdefault(cle, [])
            choix = [i for i in e['actives'] if i != e['att'] and i not in deja]
            i = choix[0]; deja.append(i); plan[cle] -= 1
            page.wait_for_timeout(350)
            taper(page, i, touch)
            trace.append(('faux', cle, i))
        else:
            taper(page, e['att'], touch)
            trace.append(('bon', cle, e['att']))
        page.wait_for_timeout(delai)
    return trace

def journal(page): return page.evaluate("() => (window.__h || window.__bulles || {journal:[]}).journal")

with sync_playwright() as p:
    nav = p.chromium.launch()

    # ---------- 0. Courbe de niveaux ----------
    ctx, page = nouvelle_page(nav, 800, 1280)
    courbe = page.evaluate("""() => [1, 3, 6, 8, 9, 10].map(n => { const r = MJ.TYPES.bulles.reglages(n, {});
       return {n, bulles:r.bulles, longueurs:r.longueurs, vitesse:+r.vitesse.toFixed(2), intervalle:+r.intervalle.toFixed(2), rayon:+r.rayon.toFixed(1), vies:r.vies, repetitions:r.repetitions}; })""")
    cal = page.evaluate("() => [1,2,3,5,10].map(niv => ({salle:niv, n:MJ.reglages('bulles', niv, {}).niveauEffectif}))")
    bilan['courbe'] = courbe; bilan['calibrage_salle'] = cal
    for c in courbe: print('   n=%(n)-2s bulles=%(bulles)s suites=%(longueurs)s dérive=%(vitesse)s u/s intervalle=%(intervalle)s s rayon=%(rayon)s vies=%(vies)s' % c)
    print('   salle → niveau effectif :', cal)
    ctx.close()

    # ---------- 1. Robot parfait, par les vrais boutons, aux 3 tailles ----------
    for (w, h) in TAILLES:
        ctx, page = nouvelle_page(nav, w, h)
        par_la_salle(page, 10)
        page.evaluate(ECHANTILLON)
        tr = robot(page, touch=(w == 390))
        page.wait_for_timeout(300)
        gagne = page.evaluate("!!document.querySelector('.mj-resultat.ok')")
        res = page.evaluate("window.__resJeu")
        saut = page.evaluate("window.__saut")
        j = journal(page)
        nb_bon = sum(1 for t in tr if t[0] == 'bon')
        note(f'parfait {w}x{h} : gagne les 4 manches', gagne and res and res.get('reussi') and page.evaluate("window.__finJeu") == 1 and nb_bon == 18,
             {'taps': nb_bon, 'erreurs': res and res.get('erreurs'), 'manches': [e['suite'] for e in j if e['type'] == 'montre']})
        note(f'dérive {w}x{h} : aucun saut entre deux images', saut['max'] < 4 and saut['frames'] > 300,
             {'saut_max_px': round(saut['max'], 2), 'images': saut['frames']})
        note(f'dérive {w}x{h} : vitesse constante, virages seulement aux rebonds', not saut['suspects'] and 0.84 <= saut['vMin'] and saut['vMax'] <= 1.16,
             {'virages': saut['virages'], 'suspects': saut['suspects'][:3], 'v/vref': [round(saut['vMin'], 3), round(saut['vMax'], 3)]})
        page.click('.mj-continuer'); page.wait_for_timeout(300)
        note(f'console {w}x{h} (partie gagnée)', not page.erreurs, page.erreurs[:3])
        ctx.close()

    # ---------- 2. Deux erreurs sur la 5e bulle de la manche 3, puis la bonne ----------
    ctx, page = nouvelle_page(nav, 800, 1280)
    lancer(page, 10)
    tr = robot(page, plan={(2, 4): 2})
    page.wait_for_timeout(300)
    j = journal(page)
    res = page.evaluate("window.__resJeu")
    i_f = [k for k, e in enumerate(j) if e['type'] == 'faux']
    reste = all(j[k]['type'] in ('faux',) for k in range(i_f[0], i_f[-1] + 1)) if i_f else False
    suivant = j[i_f[-1] + 1] if i_f else {}
    pas_revu = not any(e['type'] == 'montre' and e['manche'] == 2 for e in j[i_f[0]:]) if i_f else False
    note('2 erreurs en manche 3 : même bulle, pas de reprise, gagne avec 1 vie',
         res and res['reussi'] and res['erreurs'] == 2 and len(i_f) == 2 and reste and suivant.get('type') == 'bon' and suivant.get('pas') == 5 and pas_revu
         and [e['vies'] for e in j if e['type'] == 'faux'] == [2, 1] and page.evaluate("window.__finJeu") == 1,
         {'fautes': [(e['i'], e['attendu'], e['vies']) for e in j if e['type'] == 'faux'], 'ensuite': suivant})
    note('console (2 erreurs)', not page.erreurs, page.erreurs[:3])
    ctx.close()

    # ---------- 3. Trois erreurs : perdu ----------
    for (w, h) in [(390, 844), (1280, 800)]:
        ctx, page = nouvelle_page(nav, w, h)
        lancer(page, 10)
        tr = robot(page, plan={(0, 0): 1, (1, 2): 1, (2, 1): 1}, touch=(w == 390))
        page.wait_for_timeout(300)
        res = page.evaluate("window.__resJeu")
        perdu = page.evaluate("!!document.querySelector('.mj-resultat.ko')")
        note(f'3 erreurs {w}x{h} : perdu', perdu and res and res['reussi'] is False and res['erreurs'] == 3 and page.evaluate("window.__finJeu") == 1,
             {'score': res and res.get('score'), 'detail': res and res.get('detail')})
        note(f'console {w}x{h} (partie perdue)', not page.erreurs, page.erreurs[:3])
        ctx.close()

    # ---------- 4. Aides ----------
    ctx, page = nouvelle_page(nav, 800, 1280)
    mods = {'eclate': 2, 'aide': 2, 'zone': 1.25, 'lent': 0.8, 'erreurs': 1}
    lancer(page, 10, mods)
    prm = page.evaluate("() => ({lignes:window.__params.lignes, vies:window.__params.vies, eclate:window.__params.eclate, aide:window.__params.aide, vitesse:window.__params.vitesse, rayon:window.__params.rayon})")
    e = attendre_phase(page, 'joue')
    coeurs = page.evaluate("document.querySelectorAll('.mjbu-coeur').length")
    # un indice : la bonne bulle brille, le compteur baisse, le bouton se grise jusqu'à la bonne réponse
    page.click('.mjbu-indice'); page.wait_for_timeout(120)
    ind = page.evaluate("() => ({brille:[...document.querySelectorAll('.mjbu-svg .mjbu-bulle.indice')].map(b => +b.dataset.i), att:window.__bulles.attendu(), aides:window.__bulles.aides, gris:document.querySelector('.mjbu-indice').disabled})")
    tr = robot(page)
    page.wait_for_timeout(300)
    j = journal(page)
    ecl = [e2 for e2 in j if e2['type'] == 'eclate']
    res = page.evaluate("window.__resJeu")
    note('aides : 💡 fait briller la prochaine bulle', ind['brille'] == [ind['att']] and ind['aides'] == 1 and ind['gris'], ind)
    note('aides : 2 bulles éclatent (manches 2 et 3), jamais dans la suite', len(ecl) == 2 and all(e2['i'] not in sum([x['suite'] for x in j if x['type'] == 'montre'], []) for e2 in ecl), ecl)
    note('aides : vies, taille, lenteur, puis victoire', coeurs == 4 and prm['vies'] == 4 and abs(prm['rayon'] - 42.5) < 0.1 and prm['vitesse'] < 5.7 and res and res['reussi'], {k: prm[k] for k in ('vies', 'rayon', 'vitesse')})
    print('   lignes avec aides :', [(l['nom'], l['val']) for l in prm['lignes']])
    note('console (aides)', not page.erreurs, page.erreurs[:3])
    ctx.close()

    # ---------- 5. Contrat : arreter() ----------
    ctx, page = nouvelle_page(nav, 800, 1280)
    lancer(page, 10)
    attendre_phase(page, 'montre')
    page.wait_for_timeout(700)
    page.evaluate("window.__partie.arreter()")
    avant = page.evaluate("() => ({b:window.__h.bulles().map(b => [b.x, b.y]), j:window.__h.journal.length, crochet:!!window.__bulles})")
    page.wait_for_timeout(4000)
    apres = page.evaluate("() => ({b:window.__h.bulles().map(b => [b.x, b.y]), j:window.__h.journal.length})")
    note('arreter() en pleine partie : plus rien ne bouge, fin jamais appelée',
         avant['b'] == apres['b'] and avant['j'] == apres['j'] and page.evaluate("window.__finJeu") == 0 and not avant['crochet'],
         {'journal': [avant['j'], apres['j']], 'fin': page.evaluate("window.__finJeu")})
    # arreter pendant la démo
    lancer(page, 10, intro=True)
    page.wait_for_timeout(800)
    m1 = page.evaluate("document.querySelector('.mjbu-main').getAttribute('transform') + document.querySelector('.mj-demo .mjbu-bulle').getAttribute('transform')")
    page.evaluate("window.__partie.arreter()")
    m2 = page.evaluate("document.querySelector('.mjbu-main').getAttribute('transform') + document.querySelector('.mj-demo .mjbu-bulle').getAttribute('transform')")
    page.wait_for_timeout(600)
    m3 = page.evaluate("document.querySelector('.mjbu-main').getAttribute('transform') + document.querySelector('.mj-demo .mjbu-bulle').getAttribute('transform')")
    note('arreter() pendant la démo : la démo s\'arrête', m2 == m3, None)
    # le cœur retire le jeu sans appeler arreter : la boucle s'arrête seule
    lancer(page, 10)
    attendre_phase(page, 'joue')
    page.evaluate("document.getElementById('sl-plein').innerHTML = ''")
    page.wait_for_timeout(200)
    f1 = page.evaluate("() => window.__h.bulles().map(b => b.x)")
    page.wait_for_timeout(600)
    f2 = page.evaluate("() => window.__h.bulles().map(b => b.x)")
    note('écran retiré sans arreter() : la boucle s\'arrête seule', f1 == f2 and page.evaluate("window.__finJeu") == 0, None)
    note('console (contrat)', not page.erreurs, page.erreurs[:3])
    ctx.close()

    # ---------- 6. Planche-contact ----------
    panneaux = []
    def cap(page, nom, titre):
        chemin = f'{CAP}/{nom}.png'
        page.locator('.sl-cadre').screenshot(path=chemin)
        panneaux.append((chemin, titre))
    def attendre_evt(page, typ, depuis, limite=25):
        t0 = time.time()
        while time.time() - t0 < limite:
            j = journal(page)
            for e in j[depuis:]:
                if e['type'] == typ: return len(j)
            page.wait_for_timeout(25)
        return None
    def finir_manche(page):
        while True:
            e = etat(page)
            if not e or e['phase'] != 'joue': return
            taper(page, e['att']); page.wait_for_timeout(230)

    ctx, page = nouvelle_page(nav, 800, 1280)
    lancer(page, 10, {'eclate': 1, 'aide': 1}, intro=True)
    page.wait_for_timeout(2300)
    cap(page, 'p0-consigne', 'Consigne + démo')
    page.click('.mj-go')
    attendre_phase(page, 'montre')
    t0 = time.time()
    # on fige l'extinction de la 2e bulle le temps de la capture (la capture est plus lente qu'un éclair de 0,36 s)
    while time.time() - t0 < 6 and len([e for e in journal(page) if e['type'] == 'montre']) and page.evaluate("document.querySelectorAll('.mjbu-svg .mjbu-bulle.allume').length") == 0: page.wait_for_timeout(15)
    page.wait_for_timeout(520)
    while time.time() - t0 < 8 and page.evaluate("document.querySelectorAll('.mjbu-svg .mjbu-bulle.allume').length") == 0: page.wait_for_timeout(10)
    page.evaluate("() => { const b = document.querySelector('.mjbu-svg .mjbu-bulle.allume'); window.__fige = new MutationObserver(() => { if(!b.classList.contains('allume')) b.classList.add('allume'); }); window.__fige.observe(b, {attributes:true, attributeFilter:['class']}); }")
    page.wait_for_timeout(120)
    cap(page, 'p1-sequence', 'Manche 1 : la suite s\'allume')
    page.evaluate("() => window.__fige.disconnect()")
    e = attendre_phase(page, 'joue')
    taper(page, e['att']); page.wait_for_timeout(60)
    cap(page, 'p2-toucher', 'À toi : on touche')
    page.wait_for_timeout(200)
    n0 = len(journal(page))
    finir_manche(page)
    attendre_evt(page, 'ingredients', n0)
    page.wait_for_timeout(560)
    cap(page, 'p3-ingredients', 'Les ingrédients tombent')
    n0 = len(journal(page))
    attendre_evt(page, 'eclate', n0)
    page.wait_for_timeout(110)
    cap(page, 'p4-eclate', 'Aide : une bulle éclate')
    e = attendre_phase(page, 'joue')
    taper(page, e['att']); page.wait_for_timeout(380)
    e = etat(page)
    faux = [i for i in e['actives'] if i != e['att']][0]
    taper(page, faux); page.wait_for_timeout(170)
    cap(page, 'p5-vie', 'Erreur : un cœur perdu')
    page.wait_for_timeout(400)
    finir_manche(page)
    e = attendre_phase(page, 'joue')
    taper(page, e['att']); page.wait_for_timeout(300)
    page.click('.mjbu-indice'); page.wait_for_timeout(450)
    cap(page, 'p6-indice', 'Indice : la bonne bulle brille')
    finir_manche(page)
    n0 = len(journal(page))
    e = attendre_phase(page, 'joue')
    finir_manche(page)
    attendre_evt(page, 'arc', n0)
    page.wait_for_timeout(1500)
    cap(page, 'p7-arc', 'Fin : chaudron arc-en-ciel')
    t0 = time.time()
    while not fini(page) and time.time() - t0 < 8: page.wait_for_timeout(50)
    page.wait_for_timeout(500)
    cap(page, 'p8-resultat', 'Résultat')
    note('console (planche tablette)', not page.erreurs, page.erreurs[:3])
    ctx.close()

    for (w, h, nom, titre) in [(390, 844, 'p9-telephone', 'Téléphone 390×844'), (1280, 800, 'p10-paysage', 'Paysage 1280×800')]:
        ctx, page = nouvelle_page(nav, w, h)
        lancer(page, 10, {'aide': 1})
        e = attendre_phase(page, 'joue')
        taper(page, e['att'], touch=True); page.wait_for_timeout(260)
        e = etat(page); taper(page, e['att'], touch=True); page.wait_for_timeout(60)
        cap(page, nom, titre)
        note(f'console ({nom})', not page.erreurs, page.erreurs[:3])
        ctx.close()
    nav.close()

# assemblage de la planche
H = 560
imgs = []
for chemin, titre in panneaux:
    im = Image.open(chemin).convert('RGB')
    k = H / im.height
    imgs.append((im.resize((max(1, int(im.width * k)), H), Image.LANCZOS), titre))
try:
    police = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    police = ImageFont.load_default()
rangs, rang, larg, MAXW = [], [], 0, 2100
for im, t in imgs:
    if rang and larg + im.width + 16 > MAXW: rangs.append(rang); rang, larg = [], 0
    rang.append((im, t)); larg += im.width + 16
if rang: rangs.append(rang)
W = max(sum(im.width + 16 for im, t in r) for r in rangs) + 16
planche = Image.new('RGB', (W, len(rangs) * (H + 44) + 16), (13, 17, 38))
d = ImageDraw.Draw(planche)
y = 16
for r in rangs:
    x = 16
    for im, t in r:
        d.text((x + 4, y), t, fill=(255, 227, 163), font=police)
        planche.paste(im, (x, y + 30)); x += im.width + 16
    y += H + 44
sortie = os.path.join(ICI, 'planche-bulles.png')
planche.save(sortie)
print('planche :', sortie)
with open(os.path.join(CAP, 'bilan.json'), 'w', encoding='utf-8') as f:
    json.dump(bilan, f, ensure_ascii=False, indent=1)
print('BILAN :', 'TOUT VA BIEN' if bilan['ok'] else 'des échecs')
sys.exit(0 if bilan['ok'] else 1)
