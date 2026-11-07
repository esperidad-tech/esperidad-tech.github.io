"""Outils communs des bancs d'essai de l'atelier v4 (Playwright, banc test/atelier/index.html).
Le banc imite le vrai jeu : une bande en haut (62 px) et en bas (64 px), l'atelier remplit le reste."""
import os, json, time

ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, os.environ.get('AT_INDEX', 'index.html'))   # (AT_INDEX=index3.html : le banc de l'étape 3, pendant qu'une suite tourne)
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
TAILLES = [(360, 740), (390, 844), (844, 390), (800, 1280), (1280, 800)]
STYLE_BANC = '#reglages{display:none!important} body{padding:62px 0 64px;background:#131932}'

OUTILS = r"""(() => { window.T = {
  rect(sel){ const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if(!e) return null; const r = e.getBoundingClientRect(); return {x:r.left + r.width / 2, y:r.top + r.height / 2, w:r.width, h:r.height, l:r.left, t:r.top}; },
  /* un point de l'élément qui est vraiment sous le doigt (rien devant) */
  prise(sel){
    const d = typeof sel === 'string' ? document.querySelector(sel) : sel; if(!d) return null;
    const r = d.getBoundingClientRect(), p = document.querySelector('.at-piece').getBoundingClientRect();
    for(const fy of [.55,.45,.65,.35,.75,.25,.85]) for(const fx of [.5,.4,.6,.3,.7,.2,.8]){
      const x = r.left + r.width * fx, y = r.top + r.height * fy;
      if(x < p.left + 2 || x > p.right - 2 || y < p.top + 2 || y > p.bottom - 2) continue;
      const e = document.elementFromPoint(x, y); if(e && (e === d || d.contains(e))) return {x, y};
    }
    return null; },
  objet(id){ return banc.etat.objets.find(o => o.id === id); },
  /* le milieu du bas d'un élément, en unités du monde (les deux pièces) */
  monde(sel){ const e = typeof sel === 'string' ? document.querySelector(sel) : sel; if(!e) return null; const vb = banc.vue._vb(), p = document.querySelector('.at-piece').getBoundingClientRect(), r = e.getBoundingClientRect();
    return {x:vb.x0 + (r.left + r.width / 2 - p.left + vb.pan.x) / vb.k, y:vb.y0 + (r.bottom - p.top + vb.pan.y) / vb.k}; },
  /* la zone qu'on touche d'un objet (sa zone invisible agrandie s'il est petit) */
  touche(sel){ const e = document.querySelector(sel); if(!e) return null; const h = e.querySelector(':scope > svg > rect[fill="transparent"]'), r = (h || e).getBoundingClientRect(); return {w:r.width, h:r.height}; },
  voir(x, y){ banc.vue._voir(x, y); },
  voirEl(sel){ const e = document.querySelector(sel), vb = banc.vue._vb(), p = document.querySelector('.at-piece').getBoundingClientRect(), r = e.getBoundingClientRect();
    const lx = vb.x0 + (r.left + r.width / 2 - p.left + vb.pan.x) / vb.k, ly = vb.y0 + (r.top + r.height / 2 - p.top + vb.pan.y) / vb.k; banc.vue._voir(lx, ly); },
  toast(){ const t = document.querySelector('.at-toast'); return t && !t.hidden ? t.textContent : ''; },
  lu(){ return (window.journal || []).filter(l => l.startsWith('🔊')).slice(-1)[0] || ''; },
  a(cls){ return document.querySelector('.at').classList.contains(cls); },
  /* tailles : tout ce qu'on touche dans un panneau ou un gros plan, et les icônes de contenu */
  tailles(racine){
    const R = document.querySelector(racine); if(!R) return null;
    const vis = e => { const r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0 && getComputedStyle(e).visibility !== 'hidden'; };
    const touches = [...R.querySelectorAll('button, .at-case, .at-jeton-g, [data-de]')].filter(vis).map(e => { const r = e.getBoundingClientRect(); return {c:e.className, m:Math.round(Math.min(r.width, r.height))}; });
    const ics = [...R.querySelectorAll('.at-chipi span, .at-jeton-g span, .at-gj span, .at-ri-ic, .at-pot-gros, .at-an-ic, .at-ch-go-ic')].filter(vis).map(e => Math.round(parseFloat(getComputedStyle(e).fontSize)));
    const txt = [...R.querySelectorAll('p, b, small, h3, h4, span')].filter(vis).filter(e => e.textContent.trim() && !e.children.length).map(e => Math.round(parseFloat(getComputedStyle(e).fontSize)));
    return {touchMin:touches.length ? Math.min(...touches.map(t => t.m)) : 0, petits:touches.filter(t => t.m < 48).map(t => t.c + ':' + t.m).slice(0, 6), icMin:ics.length ? Math.min(...ics) : 0, txtMin:txt.length ? Math.min(...txt) : 0};
  }
}; })()"""

def o(i, t, x, y, **kw):
    d = {"id": i, "t": t, "x": x, "y": y, "f": 0, "v": kw.pop('v', 0), "sur": kw.pop('sur', None)}
    d.update(kw); return d
def fx(cases=None):
    return {"id": "fx", "t": "fioles_ingr", "fixe": 1, "x": 0, "y": 0, "f": 0, "v": 0, "sur": None, "cases": cases or [{"e": [], "i": {}} for _ in range(4)]}
def vide(n=1): return [{"e": [], "i": {}} for _ in range(n)]

# Un atelier installé (nouvelle pièce de 1200 de large) : quelques rangements, la lampe, le chat
ETAT_ATELIER = {"v": 3, "n": 40, "nc": 0, "cartons": [], "boutique": [], "flaque": 0, "cadeauRangements": 1, "appris": {},
  "panier": {"eau": 2, "baies": 3, "miel": 1, "champignon": 2}, "nouveaux": 8,
  "objets": [
    fx(),
    o('o1', 'caisse', 470, 770, cases=vide()),
    o('o2', 'commode', 800, 830, cases=vide(3)),
    o('o3', 'etagere', 215, 384), o('o4', 'bocaux', 0, 0, sur={"o": "o3", "k": 1, "dx": 0}, cases=[{"e": ["eau"], "i": {}}, {"e": [], "i": {}}, {"e": [], "i": {}}]),
    o('o5', 'sac', 330, 850, cases=vide()), o('o8', 'table', 1070, 840),
    o('o6', 'lampe', 0, 0, sur={"o": "o8", "k": 0, "dx": -40}, on=0), o('o9', 'tapis', 620, 845, v=1),
    o('o7', 'chat', 620, 850, v=2), o('o10', 'tableau', 215, 230)
  ]}

# Une sauvegarde de l'atelier FIGÉ (v1) : panier plein, de l'eau dans un tiroir, pas de porte-fioles
ETAT_V1 = {"v": 1, "n": 12, "nc": 0, "cartons": [], "boutique": [], "flaque": 0,
  "panier": {"brume": 2, "pensee": 1},
  "objets": [
    o('o1', 'caisse', 300, 700, cases=[{"e": ["baies"], "i": {"baies": 5}}]),
    o('o2', 'commode', 470, 640, cases=[{"e": ["eau"], "i": {"eau": 3}}, {"e": ["miel"], "i": {"miel": 2}}, {"e": [], "i": {"champignon": 2}}]),
    o('o3', 'etagere', 215, 384), o('o4', 'bocaux', 0, 0, sur={"o": "o3", "k": 1, "dx": 0}, cases=[{"e": ["trefle"], "i": {"trefle": 3}}, {"e": [], "i": {}}, {"e": [], "i": {"lavande": 1}}]),
    o('o5', 'chat', 520, 820, v=1), o('o6', 'lampe', 0, 0, sur={"o": "etabli", "k": 0, "dx": -100}, on=1),
    o('o7', 'tapis', 520, 800, v=1), o('o8', 'horloge', 750, 214), o('o9', 'casier', 140, 300, cases=vide(4))
  ]}

def page(b, t):
    pg = b.new_page(viewport={'width': t[0], 'height': t[1]})
    errs = []
    pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
    pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
    pg.goto(URL); pg.add_style_tag(content=STYLE_BANC); pg.evaluate(OUTILS)
    return pg, errs

def monter(pg, etat, **banc):
    js = "banc.etat = " + json.dumps(etat) + ";"
    for k, v in banc.items(): js += f" banc.{k} = {json.dumps(v)};"
    pg.evaluate(js + " banc.creer()")
    pg.wait_for_timeout(500)

def att(pg, ms): pg.wait_for_timeout(ms)
def toucher(pg, p, dy=0):
    if isinstance(p, str): p = pg.evaluate(f"T.prise({json.dumps(p)})") or pg.evaluate(f"T.rect({json.dumps(p)})")
    if not p: raise Exception('rien à toucher')
    pg.mouse.move(p['x'], p['y'] + dy); pg.mouse.down(); pg.mouse.up()
    return p
GESTE_NET = r"""(a) => {
  if(a.sel){ const q = T.prise(a.sel); if(!q) return false; a.x = q.x; a.y = q.y; }   /* le point et le toucher d'un seul coup (le chat se promène) */
  const el = document.elementFromPoint(a.x, a.y); if(!el) return false;
  const o = {bubbles:true, cancelable:true, composed:true, clientX:a.x, clientY:a.y, pointerId:7, pointerType:'mouse', isPrimary:true, button:0, buttons:1, view:window};
  el.dispatchEvent(new PointerEvent('pointerdown', o)); el.dispatchEvent(new MouseEvent('mousedown', o));
  for(let i = 1; i <= a.n; i++){
    const m = Object.assign({}, o, {clientX:a.x + a.dx * i / a.n, clientY:a.y + a.dy * i / a.n});
    (document.elementFromPoint(m.clientX, m.clientY) || el).dispatchEvent(new PointerEvent('pointermove', m));
  }
  const f = Object.assign({}, o, {clientX:a.x + a.dx, clientY:a.y + a.dy, buttons:0});
  const el2 = document.elementFromPoint(f.clientX, f.clientY) || el;
  el2.dispatchEvent(new PointerEvent('pointerup', f)); el2.dispatchEvent(new MouseEvent('mouseup', f));
  let c = el; while(c && !c.contains(el2)) c = c.parentElement;
  (c || el).dispatchEvent(new MouseEvent('click', f));
  return {x:a.x, y:a.y}; }"""
def toucher_net(pg, p, dx=0, dy=0, n=0):
    """Un toucher (ou un tout petit glissé) d'un seul coup, comme un doigt rapide : la machine d'essai, très chargée,
    met parfois plus d'un quart de seconde entre « appuyer » et « lever » avec la vraie souris (le meuble se soulèverait)."""
    if not pg.evaluate(GESTE_NET, {'x': p['x'], 'y': p['y'], 'dx': dx, 'dy': dy, 'n': n}): raise Exception('rien à toucher')
    return p
def glisser(pg, a, b, pas=14):
    """Glisser tout de suite (sans garder le doigt) : d'un seul coup, pour que la machine d'essai chargée n'en fasse pas un « appuyer, garder »."""
    toucher_net(pg, a, b['x'] - a['x'], b['y'] - a['y'], pas)
def clic(pg, sel):
    pg.evaluate("(s => { const e = document.querySelector(s); if(!e) throw new Error('absent : ' + s); e.dispatchEvent(new MouseEvent('click', {bubbles:true})); })", sel)
def cap(pg, nom, t, prefixe='n'):
    pg.screenshot(path=os.path.join(CAP, f'{prefixe}-{t[0]}x{t[1]}-{nom}.png'))
def chat(pg): return pg.evaluate("banc.vue._chat()")
def endormir_chat(pg, oid='o7'):
    """Le chat se promène : on le touche pour qu'il dorme 30 s (il ne passe plus devant les meubles)."""
    t0 = time.time()
    while time.time() - t0 < 10:
        pg.evaluate(f"T.voirEl('[data-obj=\"{oid}\"]')"); att(pg, 120)      # la pièce glisse jusqu'au chat
        p = pg.evaluate(f"T.prise('[data-obj=\"{oid}\"]')")
        if p:
            toucher_net(pg, p); att(pg, 700)
            c = chat(pg)
            if c['dort'] and c['reste'] > 25000: return True     # endormi par le toucher (pas une petite sieste à lui)
        att(pg, 300)
    return False


# ---------- les gestes et les vérifications partagés par essai.py et essai2.py ----------
class Bilan:
    def __init__(s): s.log = []; s.ko = []
    def v(s, ok, msg):
        s.log.append(('ok  ' if ok else 'KO  ') + msg)
        if not ok: s.ko.append(msg)
        return ok
    def note(s, msg): s.log.append('    ' + msg)

def amener(pg, sel):
    """La pièce glisse pour montrer la chose (comme un doigt qui fait défiler)."""
    pg.evaluate(f"T.voirEl({json.dumps(sel)})"); att(pg, 150)

def taper(pg, sel, attente=350):
    """Toucher une chose de la pièce : on la montre, puis on touche un point vraiment visible ; sinon un clic (clavier)."""
    amener(pg, sel)
    p = pg.evaluate(GESTE_NET, {'sel': sel, 'x': 0, 'y': 0, 'dx': 0, 'dy': 0, 'n': 0})
    if not p: att(pg, 750); clic(pg, sel)
    att(pg, attente)
    return bool(p)

CALME = r"""(s) => { const e = document.querySelector(s); if(!e) return true;
  const p = e.closest('.at-grim, .at-ouvert, .at-toast') || e;
  return !p.getAnimations({subtree:true}).concat(e.getAnimations()).some(a => a.playState === 'running' && a.effect && a.effect.getComputedTiming().iterations !== Infinity); }"""
def calme(pg, sel, max_ms=3000):
    """On attend que le panneau ait fini d'arriver (la machine d'essai chargée ralentit les animations)."""
    t0 = time.time()
    while time.time() - t0 < max_ms / 1000 and not pg.evaluate(CALME, sel): att(pg, 100)

def taper_ui(pg, sel, attente=300):
    """Toucher un bouton d'un panneau ou d'un gros plan (on fait d'abord défiler le panneau s'il le faut, comme un doigt)."""
    calme(pg, sel)
    pg.evaluate(f"(s => {{ const e = document.querySelector(s); if(e) e.scrollIntoView({{block:'nearest'}}); }})({json.dumps(sel)})")
    p = pg.evaluate(f"T.prise({json.dumps(sel)})") or pg.evaluate(f"T.rect({json.dumps(sel)})")
    if not p: raise Exception('absent : ' + sel)
    toucher(pg, p); att(pg, attente)

def prise_sure(pg, sel, essais=6):
    """Un point de la chose, visible (on la montre ; on attend qu'une bulle ou une étincelle s'en aille)."""
    for i in range(essais):
        amener(pg, sel)
        p = pg.evaluate(f"T.prise({json.dumps(sel)})")
        if p: return p
        att(pg, 350)
    return pg.evaluate(f"T.rect({json.dumps(sel)})")

def tenir_glisser(pg, a, b, pas=16, tenir=380):
    """Appuyer, garder le doigt (le meuble se soulève), puis glisser."""
    pg.mouse.move(a['x'], a['y']); pg.mouse.down(); att(pg, tenir)
    pg.mouse.move(b['x'], b['y'], steps=pas); att(pg, 80); pg.mouse.up(); att(pg, 500)

def attendre_fin_defile(pg, max_s=30):
    """Le doigt est au bord : on attend que la pièce ait fini de défiler (au bout du monde, ou plus rien ne bouge pendant 1 s)."""
    t0, stable, a0 = time.time(), 0, None
    while time.time() - t0 < max_s:
        v = pg.evaluate("(() => { const v = banc.vue._vb(), p = document.querySelector('.at-piece').getBoundingClientRect(); return {x:v.pan.x, max:v.w * v.k - p.width}; })()")
        if v['x'] >= v['max'] - 1 or v['x'] <= 0.5 and a0 is not None and a0 > v['x']: return
        stable = stable + 1 if a0 is not None and abs(v['x'] - a0) < 0.5 else 0
        if stable >= 8: return
        a0 = v['x']; att(pg, 130)

def ouvert(pg): return pg.evaluate("!document.querySelector('.at-ouvert').hidden")
def panneau(pg): return pg.evaluate("(() => { const g = document.querySelector('.at-grim'); return g.hidden ? '' : g.className; })()")
def stock(pg): return pg.evaluate("Atelier.compter(banc.etat)")
def ids(pg, t): return pg.evaluate(f"banc.etat.objets.filter(o => o.t === '{t}').map(o => o.id)")
def obj(pg, oid): return pg.evaluate(f"T.objet('{oid}')")

CARTONS_ICI = "banc.etat.cartons.filter(k => (k.ch ? 1 : 0) === banc.vue._salle())"
def ouvrir_cartons(pg):
    """Ouvre les cartons de la pièce où l'on est (ceux de la chambre restent dans la chambre)."""
    n = 0
    while pg.evaluate(CARTONS_ICI + '.length') > 0 and n < 60:
        dernier = pg.evaluate(CARTONS_ICI + '[0].reste.length') == 1
        taper(pg, '.at-carton', 900 if dernier else 330)
        n += 1
    return n

def ouvrir_cartons_vite(pg):
    """Ouvre tous les cartons sans faire défiler (pour préparer une pièce)."""
    for i in range(80):
        # (en un seul coup : le carton peut disparaître entre la question et le clic)
        if not pg.evaluate("(() => { const k = document.querySelector('.at-carton'); if(k) k.dispatchEvent(new MouseEvent('click', {bubbles:true})); return !!k; })()"): return
        att(pg, 230 if pg.evaluate("(() => { const k = " + CARTONS_ICI + "[0]; return !!(k && k.reste.length); })()") else 760)

def point_surface(pg, cle):
    """Un point du mur (fond, murG, murD) ou du plancher (sol) qui se voit et où rien n'est posé devant."""
    return pg.evaluate("""(cle => { const p = document.querySelector('.at-piece').getBoundingClientRect();
      for(let fy = .1; fy < .96; fy += .05) for(const fx of [.5, .4, .6, .3, .7, .2, .8, .1, .9, .04, .96]){
        const x = p.left + p.width * fx, y = p.top + p.height * fy, e = document.elementFromPoint(x, y);
        if(e && e.closest('[data-surf="' + cle + '"]') && !e.closest('.at-o, [data-at], .at-tas, .at-carton')) return {x, y};
      } return null; })""" + f"({json.dumps(cle)})")

def tailles(pg, B, racine, nom, ic=True):
    t = pg.evaluate(f"T.tailles('{racine}')")
    B.v(t['touchMin'] >= 48, f"{nom} : ce qu'on touche ≥ 48 px (min {t['touchMin']}{' ' + str(t['petits']) if t['petits'] else ''})")
    if ic: B.v(t['icMin'] >= 32, f"{nom} : icônes de contenu ≥ 32 px (min {t['icMin']})")
    B.v(t['txtMin'] >= 13, f"{nom} : texte lisible ≥ 13 px (min {t['txtMin']})")

import importlib.util as _iu, sys as _sys
_spec = _iu.spec_from_file_location('essai_chaudron', os.path.join(ICI, '..', 'chaudron', 'essai.py'))
_argv, _sys.argv = _sys.argv, _sys.argv[:1]          # le banc du chaudron lit ses propres arguments
_ch = _iu.module_from_spec(_spec); _spec.loader.exec_module(_ch)
_sys.argv = _argv
ROBOT_CHAUDRON = _ch.ROBOT

def preparer_mj(pg, mode, opts=None):
    pg.wait_for_selector('.at-mj .mj-go', timeout=8000); att(pg, 250)
    pg.click('.at-mj .mj-go'); att(pg, 300)
    pg.evaluate(ROBOT_CHAUDRON)
    pg.evaluate(f"window._r = robot('{mode}', {json.dumps(opts or {})}); 0")

def finir_mj(pg, ms=260000):
    pg.wait_for_function("MJ.TYPES.chaudron._dernier.termine", timeout=ms)
    att(pg, 600)
    pg.wait_for_selector('.at-mj .mj-continuer', timeout=8000); att(pg, 300)

def lancer(scenario, tailles, nom, prefixe):
    """Lance un scénario à chaque taille ; affiche le bilan ; finit par « ERREURS : [...] »."""
    from playwright.sync_api import sync_playwright
    toutes, bilan = [], {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for t in tailles:
            pg, errs = page(b, t)
            B = Bilan()
            try:
                scenario(pg, t, B)
            except Exception as ex:
                B.v(False, 'EXCEPTION ' + repr(ex)[:300]); cap(pg, 'zz-exception', t, prefixe)
            B.v(not errs, f"console sans erreur {errs[:3]}")
            print(f'== {t[0]}x{t[1]} ==', flush=True)
            for l in B.log: print('  ', l)
            bilan[f'{t[0]}x{t[1]}'] = B.log
            toutes += [f'{t[0]}x{t[1]} : {m}' for m in B.ko]
            pg.close()
        b.close()
    json.dump(bilan, open(os.path.join(CAP, f'bilan-{nom}.json'), 'w'), ensure_ascii=False, indent=1)
    print('ERREURS :', toutes)
