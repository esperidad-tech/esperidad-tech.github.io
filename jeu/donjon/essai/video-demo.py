"""Vidéo de démonstration d'un combat complet de « La salle des rats » : python3 video-demo.py [sortie.mp4]
Playwright filme la scène à sa taille exacte (960 x 540 : moins de calcul pendant le tournage, donc le rythme réel du jeu),
puis ffmpeg l'agrandit en 1280 x 720 et la convertit en mp4.
La vidéo de Playwright n'a PAS de son (c'est normal).

Le sac ne tient que 3 recettes, et la démonstration en montre 4 (feu, fumigène, colle, huile) : le combat se joue donc
en deux essais, comme pour de vrai.
  Essai 1 (Feu, Fumigène, Colle) : l'entrée des héros puis des rats ; l'étude ; le nuage (les rats toussent) ;
    la flèche de feu (le rat brûle jusqu'au bout) ; la lumière et le critique ; la louche et la rage ;
    encore la lumière et un critique ; la colle (le rat collé ne mord pas) ; puis la fuite et « On fait le point ».
  Essai 2 (Huile, Feu, Baume) : le dernier rat rentre ; l'huile (il glisse sur le dos), le critique ; la victoire."""
import os, sys, glob, shutil, subprocess, time
from playwright.sync_api import sync_playwright

ICI = os.path.dirname(os.path.abspath(__file__))
PAGE = 'file://' + os.path.join(ICI, 'salle-rats.html')
SORTIE = sys.argv[1] if len(sys.argv) > 1 else os.path.join(ICI, 'demo-salle-rats.mp4')
TMP = os.path.join(ICI, '_video')
shutil.rmtree(TMP, ignore_errors=True)
os.makedirs(TMP)
LIBRE = "(SALLE.etat.mode === 'qui' && !SALLE.etat.occupe) || !!document.querySelector('#fin')"
t0 = time.time()


def log(m):
    print(f'{time.time() - t0:5.1f} s  {m}')


with sync_playwright() as p:
    nav = p.chromium.launch()
    ctx = nav.new_context(viewport={'width': 960, 'height': 540}, record_video_dir=TMP, record_video_size={'width': 960, 'height': 540})
    pg = ctx.new_page()
    debut_video = time.time()
    MOMENTS = []          # (nom, instant dans la vidéo) : on en tire des images à la fin, pour vérifier

    def moment(nom, dans=0.0):
        MOMENTS.append((nom, time.time() - debut_video + dans))
    erreurs = []
    pg.on('pageerror', lambda e: erreurs.append(str(e)))
    pg.route('**/fonts.g*/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))   # pas d'Internet ici
    pg.goto(PAGE)
    pg.wait_for_timeout(900)
    pg.evaluate("() => { var s = 11; SALLE.hasard = function(){ s = (s * 9301 + 49297) % 233280; return s / 233280; }; }")

    def touche(sel, apres=350):
        pg.click(sel, force=True)
        pg.wait_for_timeout(apres)

    def libre():
        pg.wait_for_function(LIBRE, timeout=40000, polling=100)
        pg.wait_for_timeout(250)

    def joue(h, g, cible, attendre=True):
        touche(f'.zone[data-type="heros"][data-id="{h}"]', 420)
        touche(f'.carte[data-id="{g}"]', 480)
        touche(f'.zone[data-type="rat"][data-id="{cible}"]' if isinstance(cible, int) else f'.zone[data-type="heros"][data-id="{cible}"]', 100)
        if attendre:
            libre()

    def devant():
        return pg.evaluate("SALLE.etat.r.filter(r => !r.mort)[0].i")

    def vivants():
        return pg.evaluate("SALLE.etat.r.filter(r => !r.mort).map(r => r.i)")

    # ===== Essai 1 =====
    log('le sac')
    for r in ['feu', 'fumigene', 'colle']:
        touche(f'.recette[data-id="{r}"] b', 480)
    touche('[data-act="descendre"]', 100)
    log('l\'entrée')
    moment('entree-heros', 1.3); moment('entree-rats', 3.6)
    libre()
    pg.wait_for_timeout(600)
    log('tour 1 : étude, nuage, flèche de feu')
    joue('sage', 'etudier', 0)
    joue('alchimiste', 'p:fumigene', 1, attendre=False); moment('nuage', 2.2); moment('nuage-toux', 3.6); libre()
    joue('pisteur', 'p:feu', 1, attendre=False); moment('feu', 1.4); libre()
    moment('tour-des-rats', 2.0)
    log('tour 2 : lumière, critique, louche')
    joue('sage', 'rune', devant(), attendre=False); moment('lumiere', 1.6); libre()
    joue('pisteur', 'fleche', devant(), attendre=False); moment('critique-ralenti', 1.9); moment('critique-choc', 2.25); moment('critique-texte', 2.7); moment('critique-brume', 3.6); libre()
    joue('alchimiste', 'louche', devant(), attendre=False); moment('louche-rage', 1.6); libre()
    log('tour 3 : lumière, critique, colle')
    joue('sage', 'rune', devant())
    joue('pisteur', 'fleche', devant())
    joue('alchimiste', 'p:colle', devant(), attendre=False); moment('colle', 2.0); libre()
    log('tour 4 : la fuite')
    touche('#fuite', 700)
    touche('[data-act="fuir"]', 100); moment('fuite', 1.3)
    pg.wait_for_function("!!document.querySelector('.point')", timeout=20000)
    pg.wait_for_timeout(2000)
    # ===== Essai 2 =====
    log('essai 2 : le sac')
    touche('[data-act="reessayer"]', 900)
    touche('.recette[data-id="fumigene"] b', 380)
    touche('.recette[data-id="colle"] b', 380)
    touche('.recette[data-id="huile"] b', 480)
    touche('.recette[data-id="baume"] b', 600)
    touche('[data-act="descendre"]', 100)
    libre()
    log('essai 2 : l\'huile, le critique')
    v = vivants()
    joue('alchimiste', 'p:huile', v[0], attendre=False); moment('huile', 2.6); libre()
    joue('pisteur', 'fleche', v[0], attendre=False)
    pg.wait_for_function("!!document.querySelector('#fin') || (SALLE.etat.mode === 'qui' && !SALLE.etat.occupe)", timeout=30000)
    tours = 0
    while pg.evaluate("!document.querySelector('#fin')") and tours < 4:
        tours += 1
        log(f'essai 2, tour suivant ({vivants()})')
        d = devant()
        joue('sage', 'rune', d)
        if pg.evaluate("!document.querySelector('#fin')"):
            joue('pisteur', 'fleche', d)
        if pg.evaluate("!document.querySelector('#fin')") and vivants():
            joue('alchimiste', 'p:baume', 'pisteur')
    pg.wait_for_function("!!document.querySelector('.victoire')", timeout=20000)
    log('victoire')
    moment('victoire', 1.5)
    pg.wait_for_timeout(3500)
    video = pg.video.path()
    ctx.close()
    nav.close()

print('erreurs JavaScript :', erreurs or 'aucune')
webm = video if os.path.exists(video) else (glob.glob(os.path.join(TMP, '*.webm')) or [None])[0]
subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', '0.6', '-i', webm, '-vf', 'scale=1280:720:flags=lanczos', '-c:v', 'libx264', '-preset', 'veryfast', '-pix_fmt', 'yuv420p', '-movflags', '+faststart', SORTIE], check=True)
duree = subprocess.run(['ffprobe', '-v', 'error', '-show_entries', 'format=duration', '-of', 'csv=p=0', SORTIE], capture_output=True, text=True).stdout.strip()
print(f'{SORTIE} : {os.path.getsize(SORTIE) // 1024} Ko, {float(duree):.1f} s')
# des images tirées de la vidéo aux moments clés (captures/video-*.png)
os.makedirs(os.path.join(ICI, 'captures'), exist_ok=True)
for nom, t in MOMENTS:
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-ss', f'{max(0, t - 0.6):.2f}', '-i', SORTIE, '-frames:v', '1', os.path.join(ICI, 'captures', f'video-{nom}.png')])
print('images :', ', '.join(n for n, t in MOMENTS))
shutil.rmtree(TMP, ignore_errors=True)
