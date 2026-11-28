# photo.py <dossier des .glb> <noms séparés par des virgules> : une image de quatre vues par golem, et ses chiffres.
import sys, os, time, json, subprocess, shutil
from playwright.sync_api import sync_playwright
ici = os.path.dirname(os.path.abspath(__file__)); d = sys.argv[1]; noms = sys.argv[2].split(',')
for n in noms: shutil.copy(f'{d}/{n}.glb', f'{ici}/{n}.glb')
srv = subprocess.Popen(['python3', '-m', 'http.server', '8771'], cwd=ici, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL); time.sleep(1)
try:
    with sync_playwright() as p:
        b = p.chromium.launch(executable_path='/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', args=['--no-sandbox', '--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'])
        for n in noms:
            pg = b.new_page(viewport={'width': 1600, 'height': 520}); err = []
            pg.on('pageerror', lambda e: err.append(str(e)))
            pg.goto('http://localhost:8771/index.html'); pg.wait_for_function('window.pret', timeout=30000)
            info = pg.evaluate(f"voir('{n}.glb')"); time.sleep(0.3)
            pg.screenshot(path=f'{d}/{n}-vues.png'); pg.close()
            print(n, json.dumps(info, ensure_ascii=False), 'Mo', round(os.path.getsize(f'{d}/{n}.glb') / 1e6, 1), err[:2])
        b.close()
finally:
    srv.terminate()
    for n in noms: os.remove(f'{ici}/{n}.glb')
