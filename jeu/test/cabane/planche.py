"""Planches contact de la cabane et de la garde-robe (Playwright + PIL).
Usage : BRUMEVAL_DIST=/chemin python3 test/cabane/planche.py
Produit dans test/cabane/planches/ :
  planche-cabane.png      la cabane aux 5 tailles d'écran (fille et garçon)
  planche-garderobe.png   la garde-robe, un emplacement par case (tout débloqué)
  planche-tenues.png      12 tenues : filles et garçons, simples et rares, debout et accroupis"""
import os, json
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', '..', 'dist'))
URL = 'file://' + os.path.join(DIST, 'index.html')
OUT = os.path.join(ICI, 'planches')
os.makedirs(OUT, exist_ok=True)
ERREURS = []
try:
    POLICE = ImageFont.truetype('/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf', 20)
except Exception:
    POLICE = ImageFont.load_default()

def planche(images, titres, cols, larg, nom, fond=(28, 36, 71)):
    vign = []
    for im in images:
        im = Image.open(im) if isinstance(im, str) else im
        k = larg / im.width
        vign.append(im.convert('RGB').resize((larg, int(im.height * k))))
    rows = [vign[i:i + cols] for i in range(0, len(vign), cols)]
    hs = [max(v.height for v in r) + 40 for r in rows]
    P = Image.new('RGB', (cols * (larg + 16) + 16, sum(hs) + 16), fond)
    d = ImageDraw.Draw(P)
    y = 16
    for ri, r in enumerate(rows):
        for ci, v in enumerate(r):
            x = 16 + ci * (larg + 16)
            P.paste(v, (x, y + 30))
            d.text((x, y + 4), titres[ri * cols + ci], fill=(255, 227, 163), font=POLICE)
        y += hs[ri]
    P.save(os.path.join(OUT, nom))
    print('  →', os.path.join(OUT, nom))

def nouvelle(b, w, h):
    pg = b.new_context(viewport={'width': w, 'height': h}).new_page()
    pg.set_default_timeout(30000)
    pg.on('pageerror', lambda e: ERREURS.append(f'PAGEERROR {e}'))
    pg.on('console', lambda m: ERREURS.append(f'console : {m.text}') if m.type == 'error' and 'ERR_' not in m.text and 'fonts' not in m.text else None)
    return pg

def creer(pg, nom, sexe='f', age=None):
    pg.goto(URL)
    pg.click('[data-act=creer]'); pg.click('[data-act=crea-role][data-r=pisteur]')
    if sexe == 'm': pg.click('[data-act=crea-opt][data-k=sexe][data-v=m]')
    if age: pg.click(f'[data-act=crea-opt][data-k=age][data-v={age}]')
    pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=commencer]')
    pg.click('[data-act=onglet][data-o=role]'); pg.wait_for_timeout(500)

TENUES = [
  ('Rôdeuse (F)', 'f', 'adulte', False, {'tete':['chapeau_rodeur','gris'], 'corps':['manteau_rodeur','foret'], 'cape':['cape_lambeaux','gris'], 'pieds':['bottes_rodeur','noir'], 'bouche':['foulard_noue','rouge'], 'arme':['grand_arc','marron'], 'bras':['brassard_archer','rouge']}),
  ('Ninja (G)', 'm', 'enfant', True, {'tete':['cagoule_ninja','noir'], 'corps':['kimono_ninja','noir'], 'jambes':['pantalon_ninja','noir'], 'pieds':['tabi_ninja','nuit'], 'mains':['tekko_ninja','noir'], 'cape':['echarpe_ninja','rouge'], 'arme':['arc_bambou','jaune'], 'fleches':['fleches_bambou','jaune']}),
  ('Exploratrice (F)', 'f', 'enfant', True, {'tete':['chapeau_aventurier','marron'], 'yeux':['lunettes_explo','marron'], 'corps':['veste_chasseur','marron'], 'jambes':['pantalon_poches','vert'], 'pieds':['bottes_explorateur','vert'], 'cou':['collier_dents','rouge'], 'carquois':['carquois_franges','orange']}),
  ('Éclaireur (G)', 'm', 'adulte', False, {'tete':['capuche_feuilles','vert'], 'yeux':['masque_feuilles','foret'], 'corps':['tunique_eclaireur','vert'], 'jambes':['collant_eclaireur','foret'], 'pieds':['bottes_feuilles','foret'], 'cape':['cape_feuilles','vert'], 'fleches':['fleches_feuille','vert'], 'carquois':['carquois_ecorce','blanc']}),
  ('Trappeur (G)', 'm', 'enfant', True, {'tete':['bonnet_trappeur','marron'], 'corps':['poncho','orange'], 'jambes':['pantalon_carreaux','rouge'], 'pieds':['mocassins','orange'], 'bouche':['echarpe_rayures','violet'], 'carquois':['carquois_hanche','marron'], 'mains':['gants_fourres','orange']}),
  ('Renarde (F)', 'f', 'adulte', True, {'tete':['capuche_renard','orange'], 'yeux':['masque_renard','orange'], 'corps':['gilet_cuir','marron'], 'jambes':['jambieres_lacees','marron'], 'pieds':['bottines_lacees','marron'], 'arme':['arbalete_chasse','marron'], 'cou':['collier_gland','marron']}),
  ('Rare : poussière d\'argent (F)', 'f', 'enfant', True, {'tete':['couronne_lucioles','vert'], 'cape':['cape_poussiere','gris'], 'pieds':['bottes_lumineuses','turquoise'], 'arme':['arc_joyaux','violet'], 'cou':['cristal_lune','turquoise'], 'corps':['tunique_lin','blanc']}),
  ('Rare : nuit étoilée (G)', 'm', 'adulte', True, {'tete':['casque_lune','blanc'], 'corps':['manteau_etoiles','violet'], 'pieds':['bottes_givre','blanc'], 'arme':['arc_lune','blanc'], 'mains':['gants_lucioles','nuit'], 'fleches':['fleches_etoile','blanc'], 'carquois':['carquois_etoiles','nuit']}),
  ('Rare : braise (G)', 'm', 'enfant', False, {'tete':['bandeau_ninja','rouge'], 'pieds':['bottes_braise','rouge'], 'arme':['arbalete_braise','orange'], 'cou':['plume_phenix','orange'], 'bras':['brassards_eclair','jaune'], 'jambes':['pantalon_runes','noir']}),
  ('Rare : aurore (F)', 'f', 'adulte', False, {'tete':['capuche_etoiles','nuit'], 'cape':['cape_aurore','turquoise'], 'yeux':['masque_papillon','rose'], 'corps':['tunique_lucioles','nuit'], 'jambes':['pantalon_etoiles','nuit'], 'fleches':['fleches_follet','turquoise'], 'carquois':['carquois_cristal','turquoise']}),
  ('Rare : forêt vivante (F)', 'f', 'enfant', False, {'corps':['armure_ecorce','marron'], 'cape':['cape_nuit','nuit'], 'cou':['coeur_foret','vert'], 'carquois':['carquois_lierre','foret'], 'bras':['brassards_runes','nuit'], 'bouche':['voile_brume','blanc']}),
  ('Couleurs vives (G)', 'm', 'adulte', True, {'tete':['chapeau_pointu','jaune'], 'bouche':['foulard_pois','rose'], 'corps':['veste_matelassee','turquoise'], 'jambes':['pantalon_bande','violet'], 'pieds':['bottes_pointues','rouge'], 'mains':['gants_rayes','orange'], 'cape':['cape_bordure','bleu'], 'arme':['arc_recourbe','vert']}),
]

with sync_playwright() as p:
    b = p.chromium.launch()
    # ---------- la cabane aux 5 tailles ----------
    print('Cabane')
    ims, tit = [], []
    for i, (w, h) in enumerate([(360, 740), (390, 844), (844, 390), (800, 1280), (1280, 800)]):
        pg = nouvelle(b, w, h)
        creer(pg, ['Naïm', 'Alicia', 'Romain', 'Siham', 'Lia'][i], 'm' if i % 2 == 0 else 'f')
        if i == 1: pg.evaluate("() => { var P = M.P(); P.moment = 3; M.sauver(); M.render(); }"); pg.wait_for_timeout(400)
        f = os.path.join(OUT, f'_cab{i}.png'); pg.screenshot(path=f); ims.append(f); tit.append(f'{w}×{h}' + (' (nuit)' if i == 1 else ''))
        pg.close()
    planche(ims, tit, 5, 300, 'planche-cabane.png')
    # ---------- s'habiller sur la cabane, partie du corps par partie du corps ; puis l'armoire-collection ----------
    print('Garde-robe')
    pg = nouvelle(b, 390, 844)
    creer(pg, 'Alicia', 'f', 'enfant')
    pg.evaluate("() => { var G = M.etatGarde(); Garde.ORDRE.forEach(function(id, i){ if(!G.a[id] && i % 2) G.a[id] = {c:Garde.ITEMS[id].c, n:i % 9 === 0 ? 1 : 0, o:i + 10}; }); M.sauver(); M.render(); }")
    pg.wait_for_timeout(400)
    ims, tit = [], []
    for z, znom in [('tete', 'Tête'), ('cou', 'Cou'), ('corps', 'Habit et cape'), ('jambes', 'Pantalon'), ('pieds', 'Bottes'), ('mains', 'Mains et arc'), ('carquois', 'Carquois')]:
        pg.evaluate(f"() => M._cabane.choisir('{z}')"); pg.wait_for_timeout(400)
        pg.evaluate("() => { var b = document.querySelectorAll('.cb-choix .cb-ic[data-ch=it]'); b = b[b.length > 1 ? 1 : 0]; if(b) b.click(); }"); pg.wait_for_timeout(300)
        pg.evaluate("() => { var b = document.querySelectorAll('.cb-couleurs .cb-coul')[Math.floor(Math.random() * 14)]; if(b) b.click(); }"); pg.wait_for_timeout(300)
        f = os.path.join(OUT, f'_gr-{z}.png'); pg.screenshot(path=f); ims.append(f); tit.append(znom)
    pg.evaluate("() => M._cabane.fermerChoix()"); pg.wait_for_timeout(300)
    f = os.path.join(OUT, '_gr-habille.png'); pg.screenshot(path=f); ims.append(f); tit.append('Habillé')
    pg.evaluate("() => M._cabane.collection()"); pg.wait_for_timeout(400)
    f = os.path.join(OUT, '_gr-collection.png'); pg.screenshot(path=f); ims.append(f); tit.append('Collection')
    pg.click('.gr-case[data-s=cape]'); pg.wait_for_timeout(400)
    f = os.path.join(OUT, '_gr-collection-cape.png'); pg.screenshot(path=f); ims.append(f); tit.append('Collection : capes')
    planche(ims, tit, 5, 300, 'planche-garderobe.png')
    pg.close()
    # ---------- 12 tenues ----------
    print('Tenues')
    pg = nouvelle(b, 1280, 800)
    creer(pg, 'Test', 'f')
    ims, tit = [], []
    for nom, sexe, age, guet, look in TENUES:
        L = {k: {'id': v[0], 'c': v[1]} for k, v in look.items()}
        html = pg.evaluate("""([sexe, age, L]) => {
          var h = Object.assign(Persos.defaut('pisteur', sexe), {age:age, niveau:4, garde:L, nom:'x'});
          var a = Persos.heros(h, {vue:'pied', anime:false, fond:true, id:'t1'}), b = Persos.heros(h, {vue:'pied', pose:'guet', anime:true, fond:true, id:'t2'});
          var d = document.getElementById('planche-x') || document.body.appendChild(Object.assign(document.createElement('div'), {id:'planche-x'}));
          d.style.cssText = 'position:fixed;inset:0;z-index:999;background:#1c2447;display:flex;gap:10px;padding:10px';
          d.innerHTML = '<div style="width:420px">' + a + '</div><div style="width:420px">' + b + '</div>';
          return true; }""", [sexe, age, L])
        pg.wait_for_timeout(250)
        f = os.path.join(OUT, f'_t{len(ims)}.png'); pg.locator('#planche-x').screenshot(path=f, clip={'x': 0, 'y': 0, 'width': 870, 'height': 640}) if False else pg.screenshot(path=f, clip={'x': 0, 'y': 0, 'width': 870, 'height': 640})
        ims.append(f); tit.append(nom + (' · ' + ('accroupi' if guet else 'debout')))
    planche(ims, [t.split(' · ')[0] for t in tit], 4, 430, 'planche-tenues.png')  # à gauche debout, à droite aux aguets (cabane)
    pg.close()
    b.close()
for f in os.listdir(OUT):
    if f.startswith('_'): os.remove(os.path.join(OUT, f))
print('ERREURS :', ERREURS)
