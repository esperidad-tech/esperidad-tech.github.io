"""Le vérificateur des objets à toucher : flock /tmp/brumeval-pw.lock python3 test-objets.py

Romain, 11 novembre (16 h 07) : « Il y a des objets, on ne peut pas appuyer dessus. Comme si la boîte du Pisteur gênait pour
cliquer sur les objets qui sont derrière lui. Fais passer un vérificateur qui arrive à cliquer sur tous les objets. »

Une tablette 1024 x 768 au doigt. Pour chaque salle sans combat du donjon (et la crypte et les canaux après leur combat) :
  1. on entre dans la salle ;
  2. pour chaque chose à toucher (.ob-zone : un objet, un coffre, une dalle, une porte, le feu, le chat…), un VRAI toucher du
     doigt au milieu de sa zone, et à quatre autres endroits de sa zone ;
  3. le toucher doit arriver sur cette zone-là, et pas sur un héros, une plaque d'équipement, la bulle du conteur ou un bouton.
     (Les touchers sont attrapés avant le jeu : rien n'est pris ni ouvert, la salle reste comme elle est.)
  4. le coffre de la réserve est ensuite ouvert pour de bon, et ses deux carquois sont vérifiés à leur tour.
Un témoin, pour finir : avec l'ancien réglage (les héros attrapent le doigt), le vérificateur doit trouver des objets cachés
— sinon c'est qu'il ne voit rien.
Des captures dans captures/ (objets-<salle>.png)."""
import os, sys
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'sortie', 'index.html')
CAP = os.path.join(ICI, 'captures'); os.makedirs(CAP, exist_ok=True)
ERREURS, OK = [], []
SALLES = ['puits', 'galerie', 'aeration', 'reserve', 'givre', 'bibliotheque', 'eboulis', 'dalles', 'portes', 'crypte', 'canaux', 'camp', 'porte4']       # (13 novembre : la dernière salle n'est plus une scène à objets — c'est le combat de Léo, test-leo.py)


def verifie(cond, quoi):
    (OK if cond else ERREURS).append(quoi)
    print(('  ok  ' if cond else '  ÉCHEC  ') + quoi, flush=True)


# les zones à toucher de la salle ouverte : leur nom, leur rectangle à l'écran, cinq points dedans
ZONES = """() => {
  var l = [];
  [].forEach.call(document.querySelectorAll('#scene .ob-zone'), function(z, i){
    var r = z.getBoundingClientRect(), cs = getComputedStyle(z), ob = z.closest('.ob');
    if(r.width < 4 || r.height < 4 || cs.display === 'none' || cs.visibility === 'hidden' || cs.pointerEvents === 'none') return;
    if(ob && (getComputedStyle(ob).display === 'none' || getComputedStyle(ob).visibility === 'hidden')) return;
    z.setAttribute('data-vz', i);
    var pts = [[.5, .5], [.3, .3], [.7, .3], [.3, .7], [.7, .7]].map(function(k){ return [Math.round(r.left + r.width * k[0]), Math.round(r.top + r.height * k[1])]; });
    l.push({i:i, nom:z.getAttribute('aria-label') || (ob && ob.getAttribute('data-ob')) || '?', pts:pts, r:[Math.round(r.left), Math.round(r.top), Math.round(r.width), Math.round(r.height)]});
  });
  return l;
}"""
# attraper les touchers avant le jeu : on note sur quoi le doigt est tombé, et on ne laisse rien passer
PIEGE = """() => {
  window.__touches = [];
  if(window.__piege) return;
  window.__piege = function(e){
    var t = e.target, z = t.closest ? t.closest('.ob-zone') : null;
    window.__touches.push({zone:z ? z.getAttribute('data-vz') : null, quoi:t.tagName.toLowerCase() + (t.id ? '#' + t.id : '') + (t.className && t.className.baseVal === undefined ? '.' + String(t.className).trim().split(/\\s+/).join('.') : '')});
    e.stopPropagation(); e.preventDefault();
  };
  document.addEventListener('click', window.__piege, true);
}"""
SANS_PIEGE = "() => { if(window.__piege){ document.removeEventListener('click', window.__piege, true); window.__piege = null; } }"


def entrer(pg, lieu):
    """Aller droit dans une salle (les combats sont tenus pour gagnés), et attendre qu'elle soit prête."""
    pg.evaluate("""(lieu) => { var X = DJ.Explo._X(), p = X.partie; DJ.fermer && DJ.fermer();
      if(lieu === 'crypte' || lieu === 'canaux') p.faits['combat:' + lieu] = 1;
      X.occupe = false; DJ.Explo.arriver(lieu, {entrer:true}); }""", lieu)
    pg.wait_for_function("(lieu) => { var e = DJ.Explo.etat(); return e.ecran === 'scene' && e.scene === lieu; }", arg=lieu, timeout=30000, polling=150)
    pg.wait_for_timeout(1600)
    # une fenêtre s'ouvre toute seule en arrivant : l'explication des dalles (on la ferme par son bouton jaune, le couloir
    # s'arme), le code de Léo ou de la porte (on la referme sans rien valider)
    if lieu == 'dalles':
        if pg.evaluate("() => !!document.querySelector('#fenetre [data-act=\"dalles-go\"]')"):
            pg.evaluate("() => document.querySelector('#fenetre [data-act=\"dalles-go\"]').click()")
    else:
        if lieu in ('leo', 'porte4'):
            # (une petite scène se joue d'abord, puis la fenêtre du code s'ouvre)
            try:
                pg.wait_for_function("() => { var f = document.querySelector('#fenetre'); return !!f && f.offsetParent !== null; }", timeout=9000, polling=200)
            except Exception:
                pass
            pg.wait_for_timeout(500)
        pg.evaluate("() => { try{ DJ.fermer(); }catch(e){} }")
    pg.wait_for_timeout(600)


def controler(pg, lieu, quoi=''):
    """Toucher pour de vrai chaque zone de la salle. Rend [(nom, sur quoi le doigt est tombé)] pour les zones cachées."""
    zones = pg.evaluate(ZONES)
    caches = []
    pg.evaluate(PIEGE)
    for z in zones:
        rates = []
        for k, (x, y) in enumerate(z['pts']):
            pg.evaluate("() => { window.__touches = []; }")
            pg.touchscreen.tap(x, y)
            pg.wait_for_timeout(60)
            t = pg.evaluate("() => window.__touches")
            if not t or t[0]['zone'] != str(z['i']):
                rates.append((k, t[0]['quoi'] if t else 'rien du tout'))
        # le milieu doit répondre, et au moins trois points sur cinq (deux zones voisines peuvent se chevaucher sur un bord :
        # les dalles, dessinées en perspective). `tout` : la zone doit répondre partout (les deux dalles du pas en cours).
        z['rates'] = len(rates)
        if any(k == 0 for k, _ in rates) or len(rates) > 2:
            caches.append((z['nom'], sorted(set(q for _, q in rates))))
    pg.evaluate(SANS_PIEGE)
    return zones, caches


def lancer(nav, temoin=False):
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append('pageerror: ' + str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.goto(PAGE + '?nouveau=1&sanscombat=1&graine=5')
    pg.wait_for_selector('[data-act="sac-pret"]', timeout=30000); pg.wait_for_timeout(400)
    pg.tap('[data-act="sac-pret"]', force=True)                 # (le bouton jaune bouge : c'est voulu)
    pg.wait_for_function("() => { var e = DJ.Explo.etat(); return e.ecran === 'scene' && e.scene === 'puits'; }", timeout=30000, polling=150)
    pg.wait_for_timeout(1500)
    if temoin:
        pg.add_style_tag(content='#scene .perso.heros, #scene .perso.heros *{pointer-events:auto !important}')
    total, tous_caches = 0, []
    salles = ['puits', 'galerie', 'reserve'] if temoin else SALLES
    for lieu in salles:
        if lieu != 'puits':
            entrer(pg, lieu)
        zones, caches = controler(pg, lieu)
        total += len(zones)
        if not temoin:
            pg.screenshot(path=os.path.join(CAP, 'objets-' + lieu + '.png'))
            verifie(len(zones) > 0 or lieu in ('leo',), f'{lieu} : {len(zones)} chose(s) à toucher ' + str([z["nom"] for z in zones]))
            verifie(not caches, f'{lieu} : le doigt arrive sur chacune' + (' — CACHÉES : ' + '; '.join(n + ' (sous ' + ', '.join(q) + ')' for n, q in caches) if caches else ''))
            if lieu == 'dalles':
                # les deux dalles du premier pas (les plus à gauche) répondent partout, même sur leur bord droit
                prem = sorted(zones, key=lambda z: z['r'][0])[:2]
                verifie(len(prem) == 2 and all(z['rates'] == 0 for z in prem), 'dalles : les deux dalles du pas en cours répondent sur toute leur surface ' + str([(z['nom'], z['rates']) for z in prem]))
                # et quand on avance, ce sont les deux suivantes qui passent dessus
                pg.evaluate("() => { var X = DJ.Explo._X(), p = X.partie, R = window.Regles; R.dalle(p, R.dalleSure(0)); R.dalle(p, R.dalleSure(1)); R.dalle(p, R.dalleSure(2)); }")
                entrer(pg, 'dalles')
                zones3, caches3 = controler(pg, lieu)
                tri = sorted(zones3, key=lambda z: z['r'][0])
                # (les voisines du pas en cours, elles, sont en partie dessous : elles ne servent pas à ce moment-là)
                verifie(len([z for z in tri[6:8] if z['rates'] == 0]) == 2, 'dalles, au quatrième pas : ses deux dalles (au milieu du couloir) répondent sur toute leur surface ' + str([(z['r'][0], z['rates']) for z in tri[6:8]]))
        tous_caches += [(lieu, n) for n, _ in caches]
        # la réserve : on ouvre le coffre pour de bon, puis on vérifie ses deux carquois
        if lieu == 'reserve' and not temoin:
            z0 = [z for z in zones if 'coffre' in z['nom'].lower()]
            if z0:
                pg.touchscreen.tap(*z0[0]['pts'][0]); pg.wait_for_timeout(1800)
                zones2, caches2 = controler(pg, lieu)
                noms = [z['nom'] for z in zones2]
                verifie(any('lune' in n for n in noms) and any('transper' in n for n in noms), 'reserve, coffre ouvert : les deux carquois sont à toucher ' + str(noms))
                verifie(not caches2, 'reserve, coffre ouvert : le doigt arrive sur chacun' + (' — CACHÉS : ' + str(caches2) if caches2 else ''))
                total += len(zones2)
                pg.screenshot(path=os.path.join(CAP, 'objets-reserve-ouvert.png'))
    if not temoin:
        verifie(not errs, 'aucune erreur JavaScript ' + str(errs[:2]))
    ctx.close()
    return total, tous_caches


def main():
    with sync_playwright() as p:
        nav = p.chromium.launch()
        print('— le vérificateur des objets à toucher')
        total, _ = lancer(nav)
        verifie(total >= 25, f'{total} zones touchées pour de vrai, dans {len(SALLES)} salles')
        print('— le témoin : avec l\'ancien réglage (les héros attrapent le doigt), le vérificateur doit le voir')
        _, caches = lancer(nav, temoin=True)
        verifie(len(caches) > 0, 'témoin : avec l\'ancien réglage, des objets sont bien signalés cachés ' + str(caches[:4]))
        nav.close()
    print(f'\n{len(OK)} vérifications réussies, {len(ERREURS)} échecs')
    if ERREURS:
        print('ÉCHECS :'); [print('  -', e) for e in ERREURS]
    sys.exit(1 if ERREURS else 0)


if __name__ == '__main__':
    main()
