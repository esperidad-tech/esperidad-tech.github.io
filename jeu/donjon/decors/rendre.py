"""Les décors de combat du donjon (chemin long) : decors.js -> PNG opaques à 2x, et une planche de contrôle.

    flock /tmp/brumeval-pw.lock python3 rendre.py               -> png/<id>.png (1920 x 744) + webp/<id>.webp, puis planche.png
    flock /tmp/brumeval-pw.lock python3 rendre.py canaux bassin -> seulement ces salles (et la planche)
    flock /tmp/brumeval-pw.lock python3 rendre.py --sans-planche
    flock /tmp/brumeval-pw.lock python3 rendre.py --planche     -> seulement la planche (avec les PNG déjà faits)

Même cadre que le décor de la salle des rats (essai/construire.py : W, Y, SOL = 960, 372, 340) : décor + lumière +
avant-plan + vignette, photographiés ensemble à 2x. Les PNG sont sans perte (optimisés) ; les WebP (qualité 90, environ
dix fois plus légers) sont fournis en plus pour la page de jeu sur tablette.

La planche (planche.png, 1920 de large) montre chaque décor à sa taille réelle de jeu (960 x 372) avec les trois héros
(images du jeu : essai/img/heros-*.png) et les vrais modules animés des monstres de la salle (anim/betes/*, anim/rat),
posés à leurs places (les places des rats de essai/src/jeu.js, et celles des démos pour les autres)."""
import sys, os, json, base64
from playwright.sync_api import sync_playwright
from PIL import Image

ICI = os.path.dirname(os.path.abspath(__file__))
DONJON = os.path.dirname(ICI)
ANIM = os.path.join(DONJON, 'anim')
HEROS_IMG = os.path.join(DONJON, 'essai', 'img')
PNG = os.path.join(ICI, 'png')
WEBP = os.path.join(ICI, 'webp')
W, Y, SOL = 960, 372, 340
IDS = ['canaux', 'toiles', 'atelier', 'ossuaire', 'bassin', 'egouts', 'crypte']

# les monstres de chaque salle (CONCEPTION-DONJON.md §7), et où ils se tiennent sur la planche
#   place 0, 1, 2 : les trois places de monstre normal (milieux à x = 599, 725, 851) ; x, y : un coin imposé
CELLULES = [
    {'id': 'canaux', 'betes': [{'m': 'rat', 'place': 0}, {'m': 'chauvesouris', 'place': 1}, {'m': 'chauvesouris', 'place': 2}]},
    {'id': 'toiles', 'betes': [{'m': 'araignee', 'place': 0}, {'m': 'feufollet', 'place': 1}, {'m': 'feufollet', 'place': 2}]},
    {'id': 'atelier', 'betes': [{'m': 'ratcuir', 'place': 2}, {'m': 'gardien', 'x': 490}]},
    {'id': 'ossuaire', 'betes': [{'m': 'feufollet', 'cx': 870}, {'m': 'roirats', 'x': 486}, {'m': 'feufollet', 'cx': 780}]},
    {'id': 'bassin', 'betes': [{'m': 'bourbe', 'x': 470, 'y': 36}]},
    {'id': 'bassin', 'variante': 'Bourbe a plongé : les 2 têtards', 'betes': [{'m': 'bourbe', 'x': 470, 'y': 36, 'etat': 'sous'}, {'m': 'tetard', 'place': 0}, {'m': 'tetard', 'place': 2}]},
    {'id': 'egouts', 'betes': [{'m': 'rat', 'place': 1}]},
    {'id': 'crypte', 'betes': [{'m': 'chauvesouris', 'place': 0}, {'m': 'chauvesouris', 'place': 2}]},
]
MODULES = {'rat': os.path.join(ANIM, 'rat', 'rat-anime.js')}
for m in ['chauvesouris', 'araignee', 'feufollet', 'gardien', 'ratcuir', 'roirats', 'bourbe', 'tetard']:
    MODULES[m] = os.path.join(ANIM, 'betes', m, m + '-anime.js')


def lire(p):
    with open(p, encoding='utf-8') as f:
        return f.read()


def b64(p, mime='image/png'):
    with open(p, 'rb') as f:
        return 'data:' + mime + ';base64,' + base64.b64encode(f.read()).decode()


def photos(pg, ids):
    os.makedirs(PNG, exist_ok=True)
    os.makedirs(WEBP, exist_ok=True)
    pg.set_viewport_size({'width': 1000, 'height': 700})
    pg.set_content('<!doctype html><html><head><style>html,body{margin:0;background:#000}#c{position:absolute;left:0;top:0}</style></head><body><div id="c"></div></body></html>')
    pg.add_script_tag(content=lire(os.path.join(ICI, 'decors.js')))
    for i in ids:
        pg.evaluate(f"() => {{ document.getElementById('c').innerHTML = DECORS.tout('{i}', {W}, {Y}, {SOL}); }}")
        pg.wait_for_timeout(200)
        f = os.path.join(PNG, i + '.png')
        pg.screenshot(path=f, clip={'x': 0, 'y': 0, 'width': W, 'height': Y})
        im = Image.open(f).convert('RGB')          # opaque
        im.save(f, 'PNG', optimize=True)
        im.save(os.path.join(WEBP, i + '.webp'), 'WEBP', quality=90, method=6)
        print('  ', i, im.size, round(os.path.getsize(f) / 1024), 'Ko (png)', round(os.path.getsize(os.path.join(WEBP, i + '.webp')) / 1024), 'Ko (webp)')


PAGE = '''<!doctype html><html><head><meta charset="utf-8"><style>
html,body{margin:0;background:#07050b;color:#e8dcc0;font-family:Georgia,"DejaVu Serif",serif}
#tete{height:64px;display:flex;align-items:center;padding:0 24px;font-size:26px;color:#ffe3a3;letter-spacing:.02em}
#tete small{font-size:15px;color:#bfa77a;margin-left:18px;font-family:"DejaVu Sans",sans-serif}
#grille{display:grid;grid-template-columns:960px 960px;gap:14px 0}
.cel{width:960px}
.titre{height:38px;display:flex;align-items:center;gap:12px;padding:0 14px;font-size:19px;color:#ffe3a3}
.titre small{font-size:14px;color:#bfa77a;font-family:"DejaVu Sans",sans-serif}
.scene{position:relative;width:960px;height:372px;overflow:hidden}
.scene>img.fond{position:absolute;left:0;top:0;width:960px;height:372px}
.h{position:absolute;top:64px;width:280px;height:320px}
.h img{position:absolute;left:0;top:0;width:280px;height:320px}
.ombre{position:absolute;border-radius:50%;background:radial-gradient(closest-side,rgba(0,0,0,.6),rgba(0,0,0,0))}
.bete{position:absolute}
</style></head><body><div id="tete">Les décors de combat du chemin long<small>chaque décor à sa taille de jeu (960 × 372), avec les héros et les vrais monstres animés de la salle</small></div><div id="grille"></div></body></html>'''

JS_PLANCHE = '''(cfg) => {
  var POS_R = [{x:494, pied:338, w:206}, {x:620, pied:342, w:210}, {x:746, pied:346, w:214}], CX = [599, 725, 851];
  var HER = [['sage', 0], ['alchimiste', 138], ['pisteur', 276]], grille = document.getElementById('grille'), acteurs = [];
  cfg.cellules.forEach(function(c, n){
    var cel = document.createElement('div'); cel.className = 'cel';
    cel.innerHTML = '<div class="titre">' + (n + 1) + ' · ' + cfg.noms[c.id] + '<small>' + (c.variante || cfg.monstres[c.id]) + '</small></div><div class="scene"><img class="fond" src="' + cfg.fonds[c.id] + '"></div>';
    grille.appendChild(cel);
    var sc = cel.querySelector('.scene');
    HER.forEach(function(h, k){
      var d = document.createElement('div'); d.className = 'h'; d.style.left = (h[1] - 40) + 'px'; d.style.zIndex = 10 + k;
      d.innerHTML = '<div class="ombre" style="left:74px;top:262px;width:130px;height:24px"></div><img src="' + cfg.heros[h[0]] + '">';
      sc.appendChild(d);
    });
    c.betes.forEach(function(b, k){
      var d = document.createElement('div'); d.className = 'bete'; d.style.zIndex = 4 + k;
      var x, y, w, h, vole = false;
      if(b.m === 'rat'){ var P = POS_R[b.place]; w = P.w * .96; h = w * 112 / 180; x = P.x + P.w * .02; y = P.pied - h * .857; }
      else {
        var info = BETES[b.m].info; w = info.cadre.w; h = info.cadre.h; vole = info.vole;
        if(b.y != null){ x = b.x; y = b.y; }
        else { var cx = b.cx != null ? b.cx : CX[b.place]; x = b.x != null ? b.x : cx - w / 2; y = 340 - h * info.sol; }
      }
      d.style.cssText += ';left:' + x + 'px;top:' + y + 'px;width:' + w + 'px;height:' + h + 'px';
      if(b.m !== 'bourbe'){
        var o = document.createElement('div'); o.className = 'ombre'; var ow = w * (vole ? .4 : .7);
        o.style.cssText = 'left:' + (x + w / 2 - ow / 2) + 'px;top:' + (334) + 'px;width:' + ow + 'px;height:' + (vole ? 12 : 18) + 'px;z-index:3;opacity:' + (vole ? .5 : 1);
        sc.appendChild(o);
      }
      sc.appendChild(d);
      var a = b.m === 'rat' ? RatAnime.creer(d) : BETES[b.m].creer(d);
      acteurs.push(a);
      try { if(a.attendre) a.attendre(); if(b.etat && a.etat) a.etat(b.etat, true); } catch(e) { console.error(e); }
    });
  });
  return acteurs.length;
}'''


def planche(pg):
    fonds = {i: b64(os.path.join(PNG, i + '.png')) for i in IDS}
    heros = {h: b64(os.path.join(HEROS_IMG, 'heros-' + h + '.png')) for h in ['sage', 'alchimiste', 'pisteur']}
    rangs = (len(CELLULES) + 1) // 2
    haut = 64 + rangs * (38 + 372) + (rangs - 1) * 14 + 16
    pg.set_viewport_size({'width': 1920, 'height': haut})
    pg.set_content(PAGE)
    pg.add_script_tag(content=lire(os.path.join(ICI, 'decors.js')))
    for m in sorted(set(b['m'] for c in CELLULES for b in c['betes'])):
        pg.add_script_tag(content=lire(MODULES[m]))
    noms = pg.evaluate("() => { var n = {}, m = {}; DECORS.ids.forEach(function(i){ n[i] = DECORS[i].nom; m[i] = DECORS[i].monstres; }); return [n, m]; }")
    n = pg.evaluate(JS_PLANCHE, {'cellules': CELLULES, 'fonds': fonds, 'heros': heros, 'noms': noms[0], 'monstres': noms[1]})
    pg.wait_for_timeout(2600)
    f = os.path.join(ICI, 'planche.png')
    pg.screenshot(path=f, full_page=True)
    im = Image.open(f).convert('RGB')
    im.save(f, 'PNG', optimize=True)
    print('planche.png', im.size, n, 'monstres', round(os.path.getsize(f) / 1024), 'Ko')


if __name__ == '__main__':
    demande = [a for a in sys.argv[1:] if not a.startswith('--')] or IDS
    with sync_playwright() as p:
        b = p.chromium.launch()
        pg = b.new_page(viewport={'width': 1000, 'height': 700}, device_scale_factor=2)
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: m.type == 'error' and errs.append(m.text))
        if '--planche' not in sys.argv:
            print('Décors :')
            photos(pg, demande)
        if '--sans-planche' not in sys.argv:
            p1 = b.new_page(viewport={'width': 1920, 'height': 1000}, device_scale_factor=1)
            p1.on('pageerror', lambda e: errs.append(str(e)))
            p1.on('console', lambda m: m.type == 'error' and errs.append(m.text))
            planche(p1)
        if errs:
            print('ERREURS :', errs)
        b.close()
