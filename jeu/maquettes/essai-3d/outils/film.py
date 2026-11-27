# un petit film image par image (temps du jeu exact) : python3 film.py demi-tour|lancer|marche
import sys, time, os, subprocess
from playwright.sync_api import sync_playwright
from PIL import Image
quoi = sys.argv[1]; W, H = 844, 390; DSF = 3; vues = []
import shutil; shutil.rmtree('/tmp/film', ignore_errors=True); os.makedirs('/tmp/film/c')
with sync_playwright() as p:
    b = p.chromium.launch(executable_path='/usr/bin/google-chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
    pg = b.new_page(viewport={'width': W, 'height': H}, device_scale_factor=DSF); err = []
    pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto('http://localhost:8765/index.html')
    for i in range(200):
        if pg.evaluate('!!(window.__essai&&window.__essai.pret)'): break
        time.sleep(0.5)
    pg.evaluate('window.__zoom = 3.0; __essai.taille(); window.__pilote = true; __essai.avancer(0.3)')
    n = [0]; infos = []
    def img():
        pg.screenshot(path='/tmp/film/%04d.png' % n[0]); n[0] += 1; vues.append(pg.evaluate('__essai.vue'))
    def jouer(sec, pas=1 / 15):
        for k in range(round(sec / pas)):
            pg.evaluate('__essai.avancer(%f)' % pas); img(); infos.append(pg.evaluate('[__essai.loco.allure, +__essai.loco.v.toFixed(2), +__essai.h.a.toFixed(2)]'))
    if quoi == 'demi-tour':
        pg.evaluate('__essai.h.x = 4; __essai.h.y = 7.0; __essai.joy.mx = 1; __essai.joy.my = 0'); jouer(1.4)
        pg.evaluate('__essai.joy.mx = -1'); jouer(1.8)
    elif quoi == 'lancer':
        if len(sys.argv) > 2: pg.evaluate('window.__face = %s' % sys.argv[2])
        pg.evaluate('__essai.h.x = 9; __essai.h.y = 7.6'); jouer(0.3); pg.evaluate("__essai.lancer('glace')"); jouer(2.6)
    elif quoi == 'tout':
        pg.evaluate('window.__zoom = 2.2; __essai.taille(); __essai.h.x = 4; __essai.h.y = 7.2'); jouer(0.4, 1 / 30)
        pg.evaluate('__essai.joy.mx = 0.45; __essai.joy.my = 0'); jouer(1.6, 1 / 30)
        pg.evaluate('__essai.joy.mx = 1'); jouer(1.3, 1 / 30)
        pg.evaluate('__essai.joy.mx = -1'); jouer(1.6, 1 / 30)
        pg.evaluate('__essai.joy.mx = 0'); jouer(0.5, 1 / 30)
        pg.evaluate('window.__zoom = 1.6; __essai.taille()'); pg.evaluate("__essai.lancer('glace')"); jouer(2.3, 1 / 30)
        pg.evaluate("__essai.lancer('feu')"); jouer(3.7, 1 / 30)
    elif quoi == 'derapage':
        pg.evaluate('__essai.h.x = 4; __essai.h.y = 7.0; __essai.joy.mx = 1; __essai.joy.my = 0'); jouer(1.3)
        pg.evaluate('__essai.joy.mx = -1'); jouer(1.2)
    elif quoi == 'annule':
        pg.evaluate('__essai.h.x = 9; __essai.h.y = 7.6'); jouer(0.3); pg.evaluate("__essai.lancer('feu')"); jouer(1.4)
        pg.evaluate('__essai.joy.mx = 1; __essai.joy.my = 0'); jouer(1.2)
    elif quoi == 'jeu':
        pg.evaluate('window.__zoom = 1.3; __essai.taille(); __essai.h.x = 9; __essai.h.y = 7.6'); jouer(0.5)
        pg.evaluate("__essai.lancer('glace')"); jouer(2.4, 1 / 20); pg.evaluate("__essai.lancer('feu')"); jouer(3.8, 1 / 20)
    elif quoi == 'marche':
        pg.evaluate('__essai.h.x = 4; __essai.h.y = 7.0; __essai.joy.mx = 0.4; __essai.joy.my = 0'); jouer(1.5)
        pg.evaluate('__essai.joy.mx = 1'); jouer(1.2); pg.evaluate('__essai.joy.mx = 0'); jouer(0.8)
    print('images', n[0], 'erreurs', err[:3]); print(infos[::3]); b.close()
import json; json.dump(vues, open('/tmp/film/vues.json', 'w'))
# les images recadrées sur le héros (pour les regarder) et le film entier
os.makedirs('/tmp/film/c', exist_ok=True)
for i, v in enumerate(vues):
    k = W / v['Ws']; sx, sy = (v['hx'] - v['camX']) * k * DSF, (v['hy'] - v['camY']) * k * DSF
    Image.open('/tmp/film/%04d.png' % i).crop((int(sx - 330), int(sy - 600), int(sx + 330), int(sy + 60))).resize((330, 330)).save('/tmp/film/c/%04d.png' % i)
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-framerate', '30' if quoi == 'tout' else ('20' if quoi == 'jeu' else '15'), '-i', '/tmp/film/%04d.png', '-vf', 'scale=844:-2', '-c:v', 'libx264', '-pix_fmt', 'yuv420p', '/tmp/barde3d/film-%s.mp4' % quoi])
