"""Filme toutes les animations du rat : python3 filmer.py [taille du rat en px, défaut 360]
Enregistre une vidéo (Playwright record_video_dir), la convertit en mp4 (ffmpeg),
et prend une capture au milieu de chaque animation (dossier captures/)."""
import os, sys, glob, shutil, subprocess, time, json
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
TAILLE = int(sys.argv[1]) if len(sys.argv) > 1 else 360
VID = os.path.join(ICI, 'video')
CAP = os.path.join(ICI, 'captures')
os.makedirs(CAP, exist_ok=True)
shutil.rmtree(VID, ignore_errors=True)
os.makedirs(VID, exist_ok=True)

# (étiquette, sous-titre, étapes à lancer, durée de la prise en ms, attendre la fin de la Promise ?)
PLAN = [
    ('entrer', 'il arrive en courant', ['entrer'], 2600, True),
    ('attendre', 'respire, renifle, claque des dents, bave', ['attendre'], 6500, False),
    ('mordre', 'bond, gueule ouverte, clac', ['mordre'], 1800, True),
    ('touche', 'il encaisse', ['touche'], 1400, True),
    ('tousser', 'le nuage', ['tousser'], 3200, True),
    ('enrager', 'yeux rouges, poils hérissés, vapeur', ['enrager'], 5500, False),
    ('ébloui', 'la lumière : il se dresse, ventre exposé', ['ébloui on'], 5000, False),
    ('ébloui : fin', '', ['ébloui off'], 1200, True),
    ('retourner', "l'huile : il glisse et tombe sur le dos", ['retourner on'], 5500, False),
    ('retourner : fin', 'il se remet sur ses pattes', ['retourner off'], 1800, True),
    ('brûler', 'le feu reste sur lui', ['brûler on'], 6000, False),
    ('brûler : fin', '', ['brûler off'], 900, False),
    ('coller', 'la colle le retient', ['coller on'], 6000, False),
    ('coller : fin', '', ['coller off'], 800, False),
    ('cible', 'point faible ouvert', ['cible on'], 2600, False),
    ('cible : fin', '', ['cible off'], 400, False),
    ('cumul', 'enragé + brûlé + ébloui', ['brûler on', 'ébloui on'], 5000, False),
    ('cumul : fin', '', ['brûler off', 'ébloui off'], 1500, False),
    ('fuir', 'la peur : il détale', ['fuir'], 3000, True),
    ('nouveau rat', '', ['nouveau rat', 'entrer'], 2600, True),
    ('exploser', 'le coup critique', ['exploser'], 6500, True),
]

def main():
    t0 = time.time()
    with sync_playwright() as p:
        b = p.chromium.launch()
        ctx = b.new_context(viewport={'width': 960, 'height': 540}, record_video_dir=VID, record_video_size={'width': 960, 'height': 540})
        pg = ctx.new_page()
        debut = time.time()
        temps = []
        errs = []
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append('console: ' + m.text) if m.type == 'error' else None)
        pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film=1&taille=' + str(TAILLE))
        pg.wait_for_timeout(600)
        for k, (nom, sous, etapes, duree, attendre) in enumerate(PLAN):
            pg.evaluate("([a, b]) => etiquette(a, b)", [nom, sous])
            temps.append([nom, round(time.time() - debut, 2)])
            pg.evaluate("""(etapes) => { window.__fini = false; etapes.reduce((p, e) => p.then(() => etape(e)), Promise.resolve()).then(() => { window.__fini = true; }, (e) => { console.error(e); window.__fini = true; }); }""", etapes)
            pg.wait_for_timeout(duree // 2)
            pg.screenshot(path=os.path.join(CAP, '%02d-%s.png' % (k, nom.replace(' ', '_').replace(':', ''))))
            pg.wait_for_timeout(duree - duree // 2)
            if attendre:
                pg.wait_for_function('window.__fini', timeout=15000)
        pg.evaluate("etiquette('', '')")
        pg.wait_for_timeout(500)
        video = pg.video.path()
        ctx.close()
        b.close()
    print('erreurs :', errs)
    json.dump(temps, open(os.path.join(ICI, 'video', 'temps.json'), 'w'), ensure_ascii=False, indent=0)
    webm = glob.glob(os.path.join(VID, '*.webm'))[0]
    mp4 = os.path.join(ICI, 'rat-anime.mp4')
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', webm, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', mp4], check=True)
    print('vidéo :', mp4, '(%.0f s de tournage)' % (time.time() - t0))

if __name__ == '__main__':
    main()
