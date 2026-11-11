"""Le robot de la carte (Romain, 5 novembre, 12 h 31 : « un bot qui appuie sur tous les boutons possibles sous la carte,
matin, midi et soir, pour tous les personnages »).
Pour chaque enquête (1 et 2), chaque rôle, chaque moment : il touche tout ce qui se touche sur la carte (lieux, maisons, visages),
mesure la bulle (pastilles coupées, texte qui sort, bulle qui sort de l'écran ou qui défile, 🔊 visibles), puis touche chaque bouton
de la bulle (les mini-jeux réussissent tout seuls) et regarde la fenêtre qui s'ouvre (débordements, erreurs). L'état est remis à
zéro avant chaque bouton, pour que tout soit essayé.
Usage : python3 tools/bot-carte.py [e1|e2] [pisteur,barde…]   (BRUMEVAL_DIST=/chemin)
Résultat : test/bot-carte/rapport.json et une capture pour chaque problème ; termine par « PROBLÈMES : n »."""
import sys, os, json, re
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')), 'index.html')
OUT = os.path.join(ICI, '..', 'test', 'bot-carte')
os.makedirs(OUT, exist_ok=True)
ENQ = [a for a in sys.argv[1:] if a in ('e1', 'e2', 'e3')] or ['e1', 'e2']   # e3 : en construction, ouverte par le mode test (#test)
ROLES = next((a.split(',') for a in sys.argv[1:] if a not in ('e1', 'e2', 'e3')), ['pisteur', 'alchimiste', 'barde', 'sage'])
problemes, erreurs = [], []
n_capt = [0]

CONTROLE = r"""() => {
  try{ document.getAnimations().forEach(function(a){ try{ if(a.effect && a.effect.getTiming().iterations !== Infinity) a.finish(); }catch(e){} }); }catch(e){}
  var f = document.querySelector('#voile:not([hidden]) .b-feuille'); if(!f) return {ouvert:false, pb:[]};
  var pb = [], bulle = f.classList.contains('b-bulle'), R = f.getBoundingClientRect(), W = innerWidth, H = innerHeight;
  function txt(e){ return (e.innerText || e.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 60); }
  function vis(e){ var cs = getComputedStyle(e); if(cs.display === 'none' || cs.visibility === 'hidden') return false; var r = e.getBoundingClientRect(); return r.width > 0 && r.height > 0; }
  if(f.scrollWidth > f.clientWidth + 2) pb.push('déborde sur le côté (' + f.scrollWidth + ' > ' + f.clientWidth + ')');
  if(bulle){
    var hd = document.querySelector('.b-entete'), tb = document.querySelector('.b-onglets'), tu = document.querySelector('.tu-bandeau');
    var haut = Math.max(hd ? hd.getBoundingClientRect().bottom : 0, tu ? tu.getBoundingClientRect().bottom : 0), bas = tb ? tb.getBoundingClientRect().top : H;
    if(f.scrollHeight > f.clientHeight + 2) pb.push('bulle trop haute, elle défile (' + f.scrollHeight + ' > ' + f.clientHeight + ')');
    if(f.style.visibility !== 'hidden') f.querySelectorAll('.b-pastille').forEach(function(p){
      if(!vis(p)) return;
      var r = p.getBoundingClientRect();
      if(r.left < 2 || r.right > W - 2) pb.push('pastille hors de l\'écran : « ' + txt(p) + ' »');
      else if(r.top < haut - 1 || r.bottom > bas + 1) pb.push('pastille sous un bandeau : « ' + txt(p) + ' »');
    });
    f.querySelectorAll('*').forEach(function(e){
      if(!vis(e)) return;
      var cs = getComputedStyle(e);
      if(e.clientHeight > 0 && e.scrollHeight > e.clientHeight + 3 && cs.overflowY === 'visible') pb.push('texte qui dépasse en hauteur : « ' + txt(e) + ' »');
      if(e.clientWidth > 0 && e.scrollWidth > e.clientWidth + 3 && cs.overflowX === 'visible') pb.push('texte qui dépasse en largeur : « ' + txt(e) + ' »');
    });
    f.querySelectorAll('[data-act=lire]').forEach(function(e){ if(vis(e)) pb.push('🔊 dans la bulle'); });
  } else {
    f.querySelectorAll('*').forEach(function(e){
      if(!vis(e) || e.closest('.b-carte-mini, svg')) return;
      var r = e.getBoundingClientRect();
      if(r.right > R.right + 2 || r.left < R.left - 2) pb.push('sort de la fenêtre : « ' + txt(e) + ' »');
    });
  }
  return {ouvert:true, bulle:bulle, pb:pb.filter(function(x, i, a){ return a.indexOf(x) === i; }).slice(0, 8), t:txt(f), type:(M.UI.modal || {}).type || null};
}"""

def note(pg, ou, pb, capt=True):
    if not pb: return
    nom = ''
    if capt:
        n_capt[0] += 1; nom = f'{n_capt[0]:03d}.png'
        try: pg.screenshot(path=os.path.join(OUT, nom))
        except Exception: nom = ''
    for x in pb:
        problemes.append({'ou': ou, 'pb': x, 'capture': nom})
        print('  ✗', ou, '—', x, nom)

def creer(b, enq, role):
    pg = b.new_context(viewport={'width': 390, 'height': 844}).new_page()
    pg.set_default_timeout(6000)
    pg.on('console', lambda m: erreurs.append(f'[{enq} {role}] {m.text[:200]}') if m.type == 'error' and 'net::' not in m.text and 'fonts' not in m.text else None)
    pg.on('pageerror', lambda e: erreurs.append(f'[{enq} {role}] PAGEERROR {str(e)[:300]}'))
    pg.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    pg.goto(URL + ('#test' if enq == 'e3' else ''))
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', role.capitalize()); pg.click('[data-act=crea-fin]')
    if enq in ('e2', 'e3'):
        pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }"); pg.click(f'[data-act=mode-test][data-i="{enq[1]}"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]')
    if enq == 'e3': pg.click('[data-act=lettre-suite]')   # la lettre « d'Odette », puis l'écran des missions
    pg.click('[data-act=commencer]'); pg.wait_for_timeout(300)
    if enq == 'e3':
        # tous les codes que ce rôle peut recevoir : tout ce qu'il a à faire se montre (même ce qui ne va pas ensemble, comme la clé et le puits)
        pg.wait_for_timeout(3000)
        pg.evaluate("""() => { var E = M.E(), P = M.P(), r = M.role(); M.cle(E.infos).forEach(function(k){ var pr = [].concat(E.infos[k].pour); if(pr.indexOf(r) >= 0) P.recus['info:' + k] = true; }); M.sauver(); }""")
    if pg.evaluate('() => !!(M.tutoTalentForce && M.tutoTalentForce())'):
        pg.click('.b-entete .b-et-heros'); pg.wait_for_timeout(200); pg.click('[data-act=hr-arbre]'); pg.wait_for_timeout(200)
        tid = pg.evaluate("() => DONNEES.TALENTS_PAR_ROLE[M.role()][2][0]")
        pg.click(f'[data-act=hr-talent][data-id={tid}]'); pg.wait_for_timeout(150); pg.click('#voile [data-act=talent]'); pg.wait_for_timeout(300)
    # les mini-jeux réussissent tout seuls ; pas de voix
    pg.evaluate("""() => { MJ.lancer = function(el, type, params, fin){ setTimeout(function(){ fin({reussi:true, score:1, essais:1}); }, 20);
        return {arreter:function(){}, pause:function(){}, reprendre:function(){}, enPause:function(){ return false; }}; };
      M.lire = function(){}; M.lireAuto = function(){}; M.UI.ecran = 'enquete'; M.UI.modal = null; M.render(); }""")
    return pg

def preparer(pg, m):
    pg.evaluate("""(m) => { var P = M.P(); P.moment = m; P.actions = M.actionsMax(); P.onglet = 'carte'; M.UI.modal = null; M.UI.ecran = 'enquete'; M.sauver(); M.render();
      window.__etat = JSON.stringify(M.S); }""", m)
    pg.wait_for_timeout(250)

def remettre(pg):
    pg.evaluate("""() => { M.S = JSON.parse(window.__etat); M.sauver(); M.UI.modal = null; M.UI.suiteMJ = null; M.UI.ecran = 'enquete'; M.P().onglet = 'carte'; M.render(); }""")
    pg.wait_for_timeout(120)

CIBLES = """() => { var vu = {}, l = [];
  document.querySelectorAll('#carte-ici [data-act]').forEach(function(e){
    var r = e.getBoundingClientRect(); if(!r.width) return;
    var k = e.dataset.act + ':' + (e.dataset.id || e.dataset.p || ''); if(vu[k]) return; vu[k] = 1;
    l.push({act:e.dataset.act, id:e.dataset.id || e.dataset.p || '', k:k});
  }); return l; }"""

def toucher_cible(pg, c):
    return pg.evaluate("""(c) => { var l = document.querySelectorAll('#carte-ici [data-act="' + c.act + '"]'), e = null;
      l.forEach(function(x){ if(!e && (x.dataset.id || x.dataset.p || '') === c.id) e = x; });
      if(!e) return false; e.dispatchEvent(new MouseEvent('click', {bubbles:true, cancelable:true})); return true; }""", c)

def boutons(pg):
    return pg.evaluate("""() => { var l = []; document.querySelectorAll('#voile .b-feuille [data-act]').forEach(function(e, i){
      var a = e.dataset.act; if(a === 'fermer' || a === 'lire' || e.disabled) return; var r = e.getBoundingClientRect(); if(!r.width) return;
      l.push({i:i, act:a, t:(e.innerText || '').replace(/\\s+/g, ' ').trim().slice(0, 40)}); }); return l; }""")

def suivre(pg, ou):
    """Après un bouton : la suite des fenêtres (explication du mini-jeu, potion, réussite automatique), jusqu'à une fenêtre ordinaire."""
    for _ in range(4):
        pg.wait_for_timeout(180)
        a = pg.evaluate("""() => { var b = document.querySelector('#voile [data-act=mj-go], #voile [data-act=mj-potion][data-id=""], #voile [data-act=mj-auto][data-oui=""]');
          if(b){ b.click(); return b.dataset.act; } return null; }""")
        if not a: break
        pg.wait_for_timeout(200)
    pg.wait_for_timeout(250)
    r = pg.evaluate(CONTROLE)
    note(pg, ou, r['pb'])
    return r

with sync_playwright() as p:
    b = p.chromium.launch()
    total = 0
    for enq in ENQ:
        for role in ROLES:
            pg = creer(b, enq, role)
            nm = pg.evaluate('() => M.E().moments.length')
            noms = pg.evaluate('() => M.E().moments')
            for m in range(nm):
                preparer(pg, m)
                cibles = pg.evaluate(CIBLES)
                print(f'{enq} {role} {noms[m]} : {len(cibles)} choses à toucher')
                for c in cibles:
                    ou = f'{enq} {role} {noms[m]} · {c["k"]}'
                    remettre(pg)
                    if not toucher_cible(pg, c): continue
                    pg.wait_for_timeout(200)
                    r = pg.evaluate(CONTROLE); total += 1
                    note(pg, ou, r['pb'])
                    if not r['ouvert']: continue
                    bs = boutons(pg)
                    for bt in bs:
                        remettre(pg)
                        if not toucher_cible(pg, c): break
                        pg.wait_for_timeout(150)
                        ok = pg.evaluate("""(bt) => { var l = []; document.querySelectorAll('#voile .b-feuille [data-act]').forEach(function(e, i){ if(i === bt.i) l.push(e); });
                          if(!l[0] || l[0].dataset.act !== bt.act) return false; l[0].click(); return true; }""", bt)
                        if not ok: continue
                        total += 1
                        suivre(pg, f'{ou} → {bt["act"]} « {bt["t"]} »')
            pg.context.close()
    b.close()
json.dump({'problemes': problemes, 'erreurs': erreurs}, open(os.path.join(OUT, 'rapport.json'), 'w'), ensure_ascii=False, indent=1)
print('TOUCHERS', total)
print('ERREURS', len(erreurs), erreurs[:10])
print('PROBLÈMES :', len(problemes))
