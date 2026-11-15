"""Le cadrage d'un film : où tombent les yeux de chaque personnage, à chaque instant demandé.
   python3 cadrage.py <film> <t1> [t2 …]
Pour chaque instant : la caméra (y, z) et, pour chaque personnage, la place de ses yeux et du haut de sa tête,
en part de la hauteur de l'image (0 = en haut, 1 = en bas). La règle (Romain, 15 novembre, 19 h 05 : « un cadrage
cinéma, la tête bien placée ») : dans un gros plan, les yeux vers 0,38 ; dans un plan moyen, vers 0,25 à 0,35.
Pour corriger un gros plan : déplacer la caméra de (f − 0,38) × 0,385 × z vers le bas (y plus grand), z étant sa distance."""
import sys, os, json
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
film, temps = sys.argv[1], [float(x) for x in sys.argv[2:]]
with sync_playwright() as p:
    nav = p.chromium.launch(args=['--disable-web-security'])
    pg = nav.new_page(viewport={'width': 1440, 'height': 616})
    pg.goto('file://' + os.path.join(ICI, 'page.html'))
    for t in temps:
        r = pg.evaluate('''([n, t]) => { var E = CINE.image(n, t), out = [];
          (E.acteurs || []).forEach(function(a){ if(!a.os || !a.proj) return; var s = a.proj.s * (a.echelle || 1), e, hd;
            if(a.type === 'leo'){ e = LeoFace.point(a.os, 'oeilD'); hd = Pantin.M.pt(a.os.tete, 0, -140); }
            else if(a.os.tete){ e = Pantin.M.pt(a.os.tete, 0, -60); hd = Pantin.M.pt(a.os.tete, 0, -120); }
            else return;
            out.push({qui:a.type, yeux:(a.proj.y + e[1] * s) / 616, haut:(a.proj.y + hd[1] * s) / 616, x:(a.proj.x + e[0] * s) / 1440}); });
          return {y:CAM.y, z:CAM.z, out:out}; }''', [film, t])
        print('%s %5.2f s  caméra y %7.1f z %6.1f   ' % (film, t, r['y'], r['z']) +
              '   '.join('%s : yeux %.2f, haut %.2f%s' % (o['qui'], o['yeux'], o['haut'], '' if 0 <= o['x'] <= 1 else ' (hors champ)') for o in r['out']))
    nav.close()
