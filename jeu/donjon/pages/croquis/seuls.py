"""Rend chaque monstre du bestiaire seul, sur fond blanc (pour en tirer un croquis de carnet)."""
import sys, os, glob
from playwright.sync_api import sync_playwright
B='/home/claude/brumeval/brumeval-sources/jeu/donjon/bestiaire'
OUT=os.path.join(os.path.dirname(os.path.abspath(__file__)), 'seuls')
JEU='/home/claude/brumeval/brumeval-sources/d-rapide/index.html'
ids=sys.argv[1:]
with sync_playwright() as p:
    b=p.chromium.launch()
    os.makedirs(OUT, exist_ok=True)
    pg=b.new_page(viewport={'width':560,'height':760},device_scale_factor=2)
    pg.goto('file://'+JEU); pg.wait_for_timeout(300)
    pg.add_script_tag(content=open(B+'/base.js').read())
    for f in sorted(glob.glob(B+'/betes/*.js')):
        try: pg.add_script_tag(content=open(f).read())
        except Exception as e: print('ERREUR',f,e)
    for i in ids:
        pg.evaluate("""(i) => { document.body.innerHTML = '<div style="position:fixed;inset:0;background:#fff">' + BT.fiche(i) + '</div>'; document.body.style.margin = 0;
          var st = document.createElement('style'); st.textContent = '.bt-carte{background:#fff!important;border:0!important;box-shadow:none!important}.bt-carte > svg.bt-abs,.bt-rang,.bt-pv,.bt-plaque,.bt-combo{display:none!important}'; document.body.appendChild(st); }""", i)
        pg.wait_for_timeout(250)
        pg.screenshot(path=OUT+'/%s.png'%i)
        print(i)
    b.close()
