"""Filme un critique qui tue, dans un vrai combat du donjon, et en tire une planche d'images et les instants clés
(19 novembre : « dès qu'il a mis le coup de dague, tout de suite l'animation se fait » — Bible §13.77).

    flock /tmp/brumeval-pw.lock python3 filmer-critique.py NOM SALLE SAC CIBLE GESTE ["h,g,c;h,g,c"] [--avant b1] [--build DOSSIER] [--vers DOSSIER]

  NOM    le nom des fichiers rendus (NOM.mp4, NOM-planche.png, NOM.json) ;
  SALLE  rats | canaux | toiles | atelier | crypte | ossuaire | bassin ; SAC : les potions (feu,huile,baume) ;
  CIBLE  b1, b2… ; GESTE : dague (ce qui marche par terre, et seulement la bête de devant) ou fleche (ce qui vole, pend ou nage) ;
  le 6e argument : des gestes à jouer d'abord (« alchimiste,p:huile,b1 ») ;
  --avant b1   une bête à tuer d'abord à la dague, pour amener CIBLE devant (le tour se finit, le Pisteur rejoue au suivant) ;
  --build      un autre donjon construit que sortie/ (pour comparer avec une version d'avant) ; --vers : où ranger (captures/critique).

Le robot triche pour être sûr du critique : juste avant le coup, il met la bête à 1 point de vie, point faible ouvert.
Ce qu'il imprime, en millisecondes depuis le toucher : « impact-heros » (le coup de dague ; pour une flèche : le départ de la
flèche), « explosion » (le module de la bête a posé sa fumée), « CRITIQUE! », « chiffre », « la main revient ».
Les neuf scénarios qui couvrent les dix bêtes (la petite araignée a le même BOUM que l'araignée) :
    rats rats feu,huile,baume b1 dague "alchimiste,p:huile,b1"      chauvesouris crypte colle,feu,baume b1 fleche
    araignee toiles fumigene,huile,feu b1 fleche                     feufollet toiles fumigene,huile,feu b2 fleche
    ratcuir atelier acide,feu,baume b1 dague                         gardien atelier acide,feu,baume b2 dague "" --avant b1
    roirats ossuaire fumigene,colle,baume b1 dague                   tetard bassin feu,fumigene,baume b1 fleche
    bourbe bassin feu,fumigene,baume b3 fleche"""
import os, sys, time, subprocess, json, shutil
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
args = sys.argv[1:]


def option(nom, defaut):
    if nom in args:
        k = args.index(nom); v = args[k + 1]; del args[k:k + 2]; return v
    return defaut


AVANT = [b for b in option('--avant', '').split(',') if b]
BUILD = option('--build', os.path.join(ICI, 'sortie'))
OUT = option('--vers', os.path.join(ICI, 'captures', 'critique'))
NOM, SALLE, SAC, CIBLE, GESTE = args[:5]
PRE = [x.split(',') for x in args[5].split(';')] if len(args) > 5 and args[5] else []
PAGE = 'file://' + os.path.join(BUILD, 'index.html')
os.makedirs(OUT, exist_ok=True)
VID = os.path.join(OUT, 'video-' + NOM); shutil.rmtree(VID, ignore_errors=True)
LIBRE = "(function(){ var e = DJ.Combat.etat(); return !!e && ((e.mode === 'qui' && !e.occupe) || e.mode === 'fin'); })()"
SUITE = "(function(){ var e = DJ.Combat.etat(); return !!e && (!e.occupe || e.mode === 'fin' || e.mode === 'monstres'); })()"
# l'espion : l'instant où chaque chose arrive dans la page (un MutationObserver), et l'instant où le jeu rend la main
ESPION = """() => {
  window.__J = []; window.__t0 = 0;
  var vus = {};
  function note(n){ var c = (n.getAttribute && (n.getAttribute('class') || '')) || ''; var p = n.parentNode && n.parentNode.getAttribute ? (n.parentNode.getAttribute('class') || '') : '';
    var cle = /scene-fx/.test(c) ? 'explosion' : /crit-texte/.test(c) ? 'CRITIQUE!' : /chiffre/.test(c) && /crit/.test(c) ? 'chiffre' : /ha-fxs/.test(p) ? 'impact-heros' : null;
    if(cle && !vus[cle]){ vus[cle] = 1; window.__J.push([cle, Math.round(performance.now() - window.__t0)]); } }
  new MutationObserver(function(l){ if(!window.__t0) return; l.forEach(function(m){ [].forEach.call(m.addedNodes, function(n){ if(n.nodeType === 1) note(n); }); }); }).observe(document.body, {childList:true, subtree:true});
  window.__top = function(){ window.__t0 = performance.now(); window.__J = []; vus = {}; var iv = setInterval(function(){ var e = DJ.Combat.etat(); if(e && ((e.mode !== 'qui' ? e.mode === 'fin' || e.mode === 'monstres' : !e.occupe))){ window.__J.push(['la main revient (' + e.mode + ')', Math.round(performance.now() - window.__t0)]); clearInterval(iv); } }, 16); };
}"""
with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True, record_video_dir=VID, record_video_size={'width': 1024, 'height': 768})
    pg = ctx.new_page(); t0 = time.time(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script("try{ speechSynthesis.speak = function(){}; }catch(e){}")
    pg.goto(PAGE + '?combat=' + SALLE + '&graine=7&sac=' + SAC)
    pg.wait_for_function(LIBRE, timeout=120000, polling=200); pg.wait_for_timeout(400)
    pg.evaluate(ESPION)

    def joue(h, g, c, force=False, top=False):
        if force:      # la triche : 1 point de vie, point faible ouvert, et le Pisteur peut jouer
            pg.evaluate("(id) => { var E = DJ.Combat._E(); E.c.b.forEach(function(m){ if(m.id === id){ m.pv = 1; m.ouvert = 3; } }); E.c.h.pisteur.joue = false; }", c)
        pg.tap(f'.b-heros[data-id="{h}"]', force=True); pg.wait_for_timeout(250)
        if not pg.query_selector(f'#bande .carte[data-id="{g}"]') and pg.query_selector('#bande [data-act="arme"][data-id="baton"]'):
            pg.tap('#bande [data-act="arme"][data-id="baton"]', force=True); pg.wait_for_timeout(250)
        pg.tap(f'#bande .carte[data-id="{g}"]', force=True); pg.wait_for_timeout(250)
        sel = '.zone[data-type="bete"]' if c in ('', None, '*') else ('.zone[data-type="heros"][data-id="%s"]' % c if c in ('sage', 'alchimiste', 'pisteur') else '#zone-' + c)
        if top:
            pg.evaluate("() => window.__top()")
        pg.eval_on_selector(sel, 'e => e.click()')
    for h, g, c in PRE:
        joue(h, g, c); pg.wait_for_timeout(400); pg.wait_for_function(SUITE, timeout=90000, polling=100)
    for b in AVANT:
        joue('pisteur', 'dague', b, force=True); pg.wait_for_timeout(400); pg.wait_for_function(SUITE, timeout=90000, polling=100); pg.wait_for_timeout(600)
    if AVANT:      # finir le tour (le Sage, l'Alchimiste), laisser jouer les monstres : le Pisteur rejoue au tour suivant
        for h, g, c in [('sage', 'oeil', '*'), ('alchimiste', 'louche', '*')]:
            try:
                joue(h, g, c); pg.wait_for_timeout(400); pg.wait_for_function(SUITE, timeout=90000, polling=100)
            except Exception as ex:
                print('  (geste sauté :', h, g, str(ex)[:60], ')')
        pg.wait_for_function(LIBRE, timeout=120000, polling=200); pg.wait_for_timeout(500)
    joue('pisteur', GESTE, CIBLE, force=True, top=True)
    tc = time.time() - t0
    pg.wait_for_timeout(6500)
    journal = pg.evaluate("() => window.__J")
    chemin = pg.video.path()
    ctx.close(); nav.close()
print(NOM, ':', ' | '.join('%s %d ms' % (a, b) for a, b in journal), '| erreurs :', errs[:2])
json.dump({'nom': NOM, 'journal': journal, 'erreurs': errs}, open(os.path.join(OUT, NOM + '.json'), 'w'), ensure_ascii=False)
out = os.path.join(OUT, NOM + '.mp4')
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', str(max(0, tc - 0.1)), '-t', '6', '-i', chemin, '-c:v', 'libx264', '-pix_fmt', 'yuv420p', out], check=True)
# la planche : une image toutes les 80 ms, depuis le toucher
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', out, '-vf', 'fps=12.5,crop=1024:470:0:90,scale=400:-1,tile=8x7', '-frames:v', '1', os.path.join(OUT, NOM + '-planche.png')], check=True)
# le gros plan : douze images, une toutes les 80 ms, à partir de l'explosion
quand = [v for k, v in journal if k in ('explosion', 'CRITIQUE!')]
if quand:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '%.2f' % (min(quand) / 1000), '-t', '2', '-i', out, '-vf', 'fps=12.5,crop=660:400:364:80,scale=500:-1,tile=4x3', '-frames:v', '1', os.path.join(OUT, NOM + '-gros-plan.png')], check=True)
shutil.rmtree(VID, ignore_errors=True)
sys.exit(1 if errs else 0)
