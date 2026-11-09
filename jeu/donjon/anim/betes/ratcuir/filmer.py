"""Filme toutes les animations de la bête et fait sa planche de poses.
    flock /tmp/brumeval-pw.lock python3 filmer.py            (vidéo <id>-demo.mp4 + planche <id>-planche.png)
    flock /tmp/brumeval-pw.lock python3 filmer.py --planche  (la planche seule, sans vidéo)
Le plan du film (window.PLAN) et le cadrage de la planche (window.CADRAGE) sont dans demo.html.
Une erreur dans la console fait échouer le tournage (code de sortie 1)."""
import os, sys, glob, shutil, subprocess, time, io
from playwright.sync_api import sync_playwright
from PIL import Image, ImageDraw, ImageFont

ICI = os.path.dirname(os.path.abspath(__file__))
ID = os.path.basename(ICI)
VIDEO = '--planche' not in sys.argv
VID = os.path.join('/tmp', 'brumeval-video-' + ID)
POLICE = '/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf'
POLICE_G = '/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf'


def planche(poses, cadrage):
    x, y, w, h = cadrage
    col = 4
    lig = (len(poses) + col - 1) // col
    pied = 46
    img = Image.new('RGB', (col * w + (col + 1) * 8, lig * (h + pied) + (lig + 1) * 8 + 50), (12, 9, 18))
    d = ImageDraw.Draw(img)
    fg, fp = ImageFont.truetype(POLICE_G, 17), ImageFont.truetype(POLICE, 13)
    d.text((10, 14), ID + ' — poses clés (taille réelle, comme dans le jeu)', font=ImageFont.truetype(POLICE_G, 20), fill=(255, 227, 163))
    for k, (nom, sous, png, propre) in enumerate(poses):
        cx, cy = 8 + (k % col) * (w + 8), 50 + 8 + (k // col) * (h + pied + 8)
        if propre:
            px, py, pw, ph = propre
            im = Image.open(io.BytesIO(png)).crop((px, py, px + pw, py + ph))
            im.thumbnail((w, h))
            fond = Image.new('RGB', (w, h), (12, 9, 18)); fond.paste(im, ((w - im.width) // 2, (h - im.height) // 2)); im = fond
        else:
            im = Image.open(io.BytesIO(png)).crop((x, y, x + w, y + h))
        img.paste(im, (cx, cy))
        d.rectangle([cx, cy + h, cx + w, cy + h + pied], fill=(28, 22, 40))
        d.text((cx + 8, cy + h + 4), '%d. %s' % (k + 1, nom), font=fg, fill=(255, 227, 163))
        d.text((cx + 8, cy + h + 25), sous[:64], font=fp, fill=(200, 184, 150))
    chemin = os.path.join(ICI, ID + '-planche.png')
    img.save(chemin, optimize=True)
    return chemin


def main():
    t0 = time.time()
    shutil.rmtree(VID, ignore_errors=True)
    os.makedirs(VID, exist_ok=True)
    errs, poses = [], []
    with sync_playwright() as p:
        b = p.chromium.launch()
        opts = {'viewport': {'width': 960, 'height': 540}, 'device_scale_factor': 1}
        if VIDEO:
            opts.update(record_video_dir=VID, record_video_size={'width': 960, 'height': 540})
        ctx = b.new_context(**opts)
        pg = ctx.new_page()
        pg.on('pageerror', lambda e: errs.append('page : ' + str(e)))
        pg.on('console', lambda m: errs.append('console : ' + m.text) if m.type == 'error' else None)
        pg.goto('file://' + os.path.join(ICI, 'demo.html') + '?film=1')
        pg.wait_for_timeout(700)
        plan = pg.evaluate('PLAN')
        cadrage = pg.evaluate('window.CADRAGE || [400, 40, 520, 340]')
        for k, e in enumerate(plan):
            nom, sous, etapes, duree, attendre, pose = e[:6]
            propre = e[6] if len(e) > 6 else None
            pg.evaluate("([a, b]) => etiquette(a, b)", [nom, sous])
            pg.evaluate("""(etapes) => { window.__fini = false; etapes.reduce((p, e) => p.then(() => etape(e)), Promise.resolve()).then(() => { window.__fini = true; }, (e) => { console.error(e && e.stack || e); window.__fini = true; }); }""", etapes)
            if pose is not None:
                t = int(duree * pose)
                pg.wait_for_timeout(t)
                poses.append((nom, sous, pg.screenshot(), propre))
                pg.wait_for_timeout(duree - t)
            else:
                pg.wait_for_timeout(duree)
            if attendre:
                pg.wait_for_function('window.__fini', timeout=20000)
        pg.evaluate("etiquette('', '')")
        pg.wait_for_timeout(400)
        video = pg.video.path() if VIDEO else None
        ctx.close()
        b.close()
    print('poses :', len(poses), '→', planche(poses, cadrage))
    if VIDEO:
        mp4 = os.path.join(ICI, ID + '-demo.mp4')
        subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', video, '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', mp4], check=True)
        print('vidéo :', mp4)
    shutil.rmtree(VID, ignore_errors=True)
    print('erreurs :', errs if errs else 'aucune')
    print('tournage : %.0f s' % (time.time() - t0))
    sys.exit(1 if errs else 0)


if __name__ == '__main__':
    main()
