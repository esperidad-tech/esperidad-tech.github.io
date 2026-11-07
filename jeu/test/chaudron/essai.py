"""Robots du mini-jeu « Le chaudron ».
Usage : python3 essai.py [390x844 800x1280 1280x800]
- gagne  : garde le vert avec 4 bûches, verse chaque ingrédient à temps, puis tient la zone de fin → réussite
- eteint : laisse mourir le feu (enlève les bûches) → « Le feu s'est éteint »
- boum   : met 6 bûches et touille dans le sens qui chauffe → « Boum ! Tout a cramé »
- gagne + {mauvais:true} : à la première fenêtre, touche une caisse qui n'est pas la bonne → « Mauvais ingrédient ! »
- gagne + {sauter:0}     : oublie la première fenêtre → une erreur (une vie), la partie continue
Les parties « gagne » au niveau 10 (le niveau joué) donnent la durée totale mesurée (début → fin de la zone tenue).
Captures : louche devant / côté / derrière, chaque zone de couleur, frise, bûches, réussite, explosion."""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
URL = 'file://' + os.path.join(ICI, 'index.html')
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
POTIONS_TOUTES = ('lumiere', 'revelatrice', 'clarte', 'fumigene', 'eclairante')
TAILLES = [tuple(int(v) for v in a.split('x')) for a in sys.argv[1:]] or [(390, 844), (800, 1280), (1280, 800)]

ROBOT = r"""(() => {
window.robot = function(mode, opts){
  opts = opts || {};
  return new Promise(function(resolve){
    var S = MJ.TYPES.chaudron._dernier, svg = document.querySelector('.mjc-svg');
    function pt(x, y){ var m = svg.getScreenCTM(), p = svg.createSVGPoint(); p.x = x; p.y = y; var q = p.matrixTransform(m); return {x:q.x, y:q.y}; }
    function ev(type, target, p, id){ target.dispatchEvent(new PointerEvent(type, {clientX:p.x, clientY:p.y, pointerId:id, bubbles:true, cancelable:true, button:0, pointerType:'touch'})); }
    var a = S.theta, id = 7, avant = null, integ = 0, tient = false, dernierLog = 0, journal = [], hmin = 100, hmax = 0, horsVert = 0, total = 0;
    var BUCHES = {violet:2, bleu:3, vert:4, 'arc-en-ciel':4, jaune:5, rouge:5, bouillant:6};
    function main(){ return pt(200 + 80 * Math.cos(a), 170 + 80 * 0.36 * Math.sin(a)); }
    function taper(el){ var r = el.getBoundingClientRect(), p = {x:r.left + r.width / 2, y:r.top + r.height / 2}; ev('pointerdown', el, p, 9); ev('pointerup', window, p, 9); }
    ev('pointerdown', svg, main(), id); tient = true;
    function pas(ts){
      if(S.fini){ if(tient) ev('pointerup', window, main(), id); resolve({journal:journal, hmin:hmin, hmax:hmax, horsVert:Math.round(horsVert / Math.max(1, total) * 100)}); return; }
      var dt = avant === null ? 0.016 : Math.min(0.05, (ts - avant) / 1000); avant = ts;
      var Z = S.Z, nom = S.finale ? S.cible : 'vert', cible = (Z[nom][0] + Z[nom][1]) / 2, w;
      if(mode === 'boum') w = 11;
      else {
        /* comme un enfant attentif : tourne plus vite tant que ça continue de dériver (terme intégral) */
        integ = Math.max(-9, Math.min(9, integ + 0.9 * (cible - S.h) * dt));
        w = Math.max(-11, Math.min(11, 0.55 * (cible - S.h) - 0.3 * S.v + integ));
      }
      a += w * dt;
      ev('pointermove', window, main(), id);
      hmin = Math.min(hmin, S.h); hmax = Math.max(hmax, S.h); total++; if(!S.finale && (S.h < Z.vert[0] || S.h > Z.vert[1])) horsVert++;
      var t = performance.now(), voulu = mode === 'gagne' ? (S.finale ? BUCHES[S.cible] : 4) : (mode === 'boum' ? (opts.buches || 6) : 0);
      if(t - dernierLog > (mode === 'eteint' ? 1500 : 450)){
        if(S.L < voulu){ taper(document.querySelector('.mjc-plus')); dernierLog = t; journal.push('+bûche ' + S.t.toFixed(1)); }
        else if(S.L > voulu){ var bs = document.querySelectorAll('.mjc-buche'); taper(bs[S.L - 1].querySelector('rect')); dernierLog = t; journal.push('-bûche ' + S.t.toFixed(1)); }
      }
      S.fen.forEach(function(f, i){
        if(f.fait || f.robot || S.t < f.s + 0.35) return;
        f.robot = 1;
        if(opts.sauter === i){ journal.push('oublie ' + f.ingr); return; }
        var k = f.ingr;
        if(opts.mauvais){ k = [].slice.call(document.querySelectorAll('.mjc-boite')).map(function(b){ return b.dataset.ingr; }).filter(function(x){ return x !== f.ingr; }).pop(); }
        taper(document.querySelector('.mjc-boite[data-ingr="' + k + '"]')); journal.push(k + ' ' + S.t.toFixed(1) + ' h=' + Math.round(S.h));
      });
      requestAnimationFrame(pas);
    }
    requestAnimationFrame(pas);
  });
};
})()"""

MOUCHARD = r"""(() => {
  const A = window.__audio = {ctx:0, boucles:0, arretees:0, dest:[], notes:0};
  const AC = window.AudioContext;
  if(!AC) return;
  window.AudioContext = class extends AC { constructor(o){ super(o); A.ctx++; } };
  [AudioScheduledSourceNode.prototype, AudioBufferSourceNode.prototype, OscillatorNode.prototype].forEach(P => {
    if(!Object.prototype.hasOwnProperty.call(P, 'start')) return;
    const st = P.start, sp = P.stop;
    P.start = function(){ A.notes++; if(this.loop){ A.boucles++; this.__l = 1; } return st.apply(this, arguments); };
    P.stop = function(){ if(this.__l && !this.__s){ this.__s = 1; A.arretees++; } return sp.apply(this, arguments); };
  });
  const co = AudioNode.prototype.connect, de = AudioNode.prototype.disconnect;
  AudioNode.prototype.connect = function(x){ if(x instanceof AudioDestinationNode){ this.__d = 1; this.__t = performance.now(); A.dest.push(this); } return co.apply(this, arguments); };
  AudioNode.prototype.disconnect = function(){ this.__d = 0; return de.apply(this, arguments); };
})()"""

def cap(pg, nom, t):
    chemin = os.path.join(CAP, f'{t[0]}x{t[1]}-{nom}.png')
    pg.screenshot(path=chemin)

def partie(pg, potion, niveau=3, mods=None):
    pg.evaluate(f"lancer({{direct:true, potion:'{potion}', niveau:{niveau}, mods:{json.dumps(mods or {})}}})")
    pg.wait_for_timeout(300)

def attendre_fin(pg, ms=260000):
    pg.wait_for_function("MJ.TYPES.chaudron._dernier && MJ.TYPES.chaudron._dernier.termine", timeout=ms)

def resultat(pg):
    pg.wait_for_selector('.mj-continuer', timeout=8000)
    pg.click('.mj-continuer')
    pg.wait_for_timeout(100)
    return pg.evaluate("window.resultat")

def main():
    bilan = {}
    with sync_playwright() as p:
        b = p.chromium.launch()
        for t in TAILLES:
            log = []
            pg = b.new_page(viewport={'width': t[0], 'height': t[1]})
            errs = []
            pg.on('console', lambda m: errs.append(m.type + ': ' + m.text) if m.type in ('error', 'warning') else None)
            pg.on('pageerror', lambda e: errs.append('PAGEERROR ' + str(e)))
            pg.add_init_script(MOUCHARD)
            pg.goto(URL); pg.add_style_tag(content='#reglages{display:none!important}')
            pg.mouse.click(3, 3)       # un vrai geste : le navigateur autorise alors le son
            pg.evaluate(ROBOT)
            pg.wait_for_timeout(1400)
            cap(pg, '00-consigne', t)
            # --- vues figées : louche, zones, bûches ---
            partie(pg, 'revelatrice')
            pg.evaluate("MJ.TYPES.chaudron._dernier.api.pause(true)")
            for nom, ang in (('louche-devant', 1.5708), ('louche-cote', 0.0), ('louche-derriere', 4.712), ('louche-trois-quarts', 0.7)):
                pg.evaluate(f"MJ.TYPES.chaudron._dernier.api.angle({ang})"); pg.wait_for_timeout(120); cap(pg, nom, t)
            for z in ('violet', 'bleu', 'vert', 'arc-en-ciel', 'jaune', 'rouge', 'bouillant'):
                f = 0.22 if z == 'vert' else 0.5
                pg.evaluate(f"(() => {{ const S = MJ.TYPES.chaudron._dernier, b = S.Z['{z}']; S.api.chaleur(b[0] + (b[1] - b[0]) * {f}); S.api.angle(0.9); }})()")
                pg.wait_for_timeout(700); cap(pg, 'zone-' + z, t)
            pg.evaluate("MJ.TYPES.chaudron._dernier.api.chaleur(MJ.TYPES.chaudron._dernier.Z.centre); MJ.TYPES.chaudron._dernier.api.buches(6)")
            pg.wait_for_timeout(500); cap(pg, 'buches-6', t)
            pg.evaluate("MJ.TYPES.chaudron._dernier.api.buches(2)")
            pg.wait_for_timeout(500); cap(pg, 'buches-2', t)
            # --- caisses : toutes les sortes d'ingrédients, sans chevauchement ---
            partie(pg, 'lumiere', 10)
            boites = pg.evaluate("""(() => { const r = [...document.querySelectorAll('.mjc-boite')].map(b => b.getBoundingClientRect());
              let ch = 0; for(let i = 0; i < r.length; i++) for(let j = i + 1; j < r.length; j++){ const a = r[i], b = r[j]; if(a.left < b.right - 1 && b.left < a.right - 1 && a.top < b.bottom - 1 && b.top < a.bottom - 1) ch++; }
              const fen = MJ.TYPES.chaudron._dernier.fen, chf = fen.some((f, i) => i && f.s < fen[i - 1].e);
              return {n:r.length, lignes:new Set(r.map(x => Math.round(x.top))).size, chevauchent:ch, fenetresChevauchent:chf, larg:Math.round(r[0].width), haut:Math.round(r[0].height),
                horsEcran:r.filter(x => x.right > innerWidth + 1 || x.left < -1).length}; })()""")
            log.append(f"caisses : {boites['n']} sur {boites['lignes']} ligne(s), {boites['larg']}×{boites['haut']} px, chevauchements {boites['chevauchent']}, hors écran {boites['horsEcran']} ; fenêtres qui se chevauchent : {boites['fenetresChevauchent']}")
            pg.evaluate("MJ.TYPES.chaudron._dernier.api.pause(true)")
            # --- un mauvais ingrédient : la potion est fichue (même avec des vies) ---
            partie(pg, 'lumiere', 3, {'erreurs': 2})
            pg.evaluate("window._r = robot('gagne', {mauvais:true}); 0")
            attendre_fin(pg); pg.wait_for_timeout(900); cap(pg, 'mauvais', t)
            res = resultat(pg)
            log.append(f"mauvais ingrédient (niveau 10 + 2 vies de plus) : {res and res.get('reussi')} « {res and res.get('message')} » {res and res.get('detail')} raison {res and res.get('raison')}")
            # --- robot qui gagne : niveau 10 (celui joué) ---
            for potion, niv in ((('lumiere', 10), ('revelatrice', 10), ('eclairante', 10), ('fumigene', 3)) if t == (800, 1280) else (('lumiere', 10), ('eclairante', 10))):
                partie(pg, potion, niv)
                pg.evaluate("window._r = robot('gagne'); 0")
                if potion == 'revelatrice':
                    pg.wait_for_function("(() => { const S = MJ.TYPES.chaudron._dernier; return S.t >= S.fen[1].s - 4; })()", timeout=200000)
                    cap(pg, 'frise', t)
                attendre_fin(pg)
                S = pg.evaluate("(() => { const S = MJ.TYPES.chaudron._dernier; return {ok:document.querySelector('.mjc-fin.ok') !== null, t:S.t, etoiles:S.etoiles, erreurs:S.erreurs, cible:S.cible}; })()")
                if potion == 'revelatrice':
                    pg.wait_for_timeout(1200); cap(pg, 'reussite', t)
                r = pg.evaluate("window._r")
                res = resultat(pg)
                au = pg.evaluate("({ctx:__audio.ctx, boucles:__audio.boucles, arretees:__audio.arretees, sorties:__audio.dest.filter(n => n.__d).length, notes:__audio.notes})")
                log.append(f"gagne {potion} niveau {niv} ({S['cible']}) : {res and res.get('reussi')} « {res and res.get('message')} » {res and res.get('detail')} · durée {S['t']:.0f} s · h {r['hmin']:.0f}–{r['hmax']:.0f} · hors du vert {r['horsVert']}% · sons : {au['notes']} notes, boucles {au['arretees']}/{au['boucles']} arrêtées, sorties encore branchées {au['sorties']}")
            # --- une fenêtre oubliée (niveau 3, 2 vies) : une erreur, la partie continue ---
            if t == (390, 844):
                partie(pg, 'lumiere', 3, {'erreurs': 1})        # 2 vies
                pg.evaluate("window._r = robot('gagne', {sauter:0}); 0")
                pg.wait_for_function("MJ.TYPES.chaudron._dernier.erreurs >= 1 || MJ.TYPES.chaudron._dernier.termine", timeout=120000)
                pg.wait_for_timeout(300); cap(pg, 'oubli', t)
                v = pg.evaluate("({vies:MJ.TYPES.chaudron._dernier.vies, termine:MJ.TYPES.chaudron._dernier.termine})")
                attendre_fin(pg)
                res = resultat(pg)
                log.append(f"fenêtre oubliée (2 vies) : vies restantes {v['vies']}, partie pas finie {not v['termine']} ; fin « {res and res.get('message')} » {res and res.get('detail')}")
            # --- robot qui laisse le feu mourir ---
            partie(pg, 'revelatrice')
            pg.evaluate("robot('eteint')")
            attendre_fin(pg); pg.wait_for_timeout(1000); cap(pg, 'eteint', t)
            res = resultat(pg)
            log.append(f"eteint : {res and res.get('reussi')} « {res and res.get('message')} » raison {res and res.get('raison')}")
            # --- robot qui surchauffe ---
            partie(pg, 'revelatrice')
            pg.evaluate("robot('boum')")
            attendre_fin(pg); pg.wait_for_timeout(450); cap(pg, 'boum', t)
            pg.wait_for_selector('.mj-continuer', timeout=8000); pg.wait_for_timeout(300)
            cap(pg, 'boum-resultat', t)
            res = resultat(pg)
            log.append(f"boum : {res and res.get('reussi')} « {res and res.get('message')} » raison {res and res.get('raison')}")
            print(f'== {t} =='); [print('  ', l) for l in log]; print('   erreurs console :', errs)
            bilan[f'{t[0]}x{t[1]}'] = {'log': log, 'erreurs': errs}
            pg.close()
        b.close()
    json.dump(bilan, open(os.path.join(CAP, 'bilan.json'), 'w'), ensure_ascii=False, indent=1)

if __name__ == '__main__':
    main()
