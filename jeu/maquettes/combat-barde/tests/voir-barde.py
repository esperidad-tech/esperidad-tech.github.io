# une planche du Barde en volume (moteur des héros en volume) : pour régler ses poses, vu de dos (version 9)
import pathlib, sys, json
from playwright.sync_api import sync_playwright
ici = pathlib.Path(__file__).resolve().parent
js = (ici.parent / 'src' / 'heros-vues.js').read_text()
poses = sys.argv[1] if len(sys.argv) > 1 else 'null'
extra = (ici.parent / 'src' / 'barde.js').read_text() if (ici.parent / 'src' / 'barde.js').exists() and '--sans' not in sys.argv else ''
html = '''<!doctype html><meta charset="utf-8"><body style="margin:0;background:#26303a"><div id="p" style="display:flex;flex-wrap:wrap"></div>
<script>''' + js + '''</script><script>
var HV = window.HerosVues, H = {role:'barde', sexe:'m', peau:'p2', cheveux:'chatain', yeux:'bleu', coiffure:'courts', combat:true};
function une(P, cap, titre){ var F = HV.melange({}, HV.pose('repos'), 1), k; for(k in P) F[k] = P[k]; F.cap = cap; F.qx = 0; F.qz = 0; F.jx = 0; F.rx = 0; F.ry = 0; F.yo = 1; F.souffle = 0.5; F.anneau = 0; F.anneauT = 0;
  var d = document.createElement('div'); d.style.cssText = 'width:230px;color:#fff;font:12px sans-serif;text-align:center';
  try { d.innerHTML = HV.svg(H, F, {id:'t' + (une.n = (une.n || 0) + 1), cadre:'-60 -40 420 480'}) + titre; } catch(e){ d.textContent = titre + ' : ' + e.message; }
  document.getElementById('p').appendChild(d); }
var LISTE = ''' + poses + ''';
if(!LISTE){ LISTE = [[{}, 180, 'repos 180'], [{}, 150, 'repos 150'], [{}, 0, 'repos 0'], [HV.POSES.dGarde, 180, 'dGarde 180']]; }
LISTE.forEach(function(l){ une(typeof l[0] === 'string' ? HV.POSES[l[0]] : l[0], l[1], l[2]); });
window.CLES = Object.keys(HV.POSES).join(' '); window.COIF = Object.keys(HV.COIFFURES).join(' ');
</script>'''
(ici / 'vues' / 'barde-essai.html').write_text(html)
with sync_playwright() as p:
    nav = p.chromium.launch(executable_path='/usr/bin/google-chrome')
    pg = nav.new_page(viewport={'width': 940, 'height': 560}); err = []; pg.on('pageerror', lambda e: err.append(str(e)))
    pg.goto((ici / 'vues' / 'barde-essai.html').as_uri()); pg.wait_for_timeout(700)
    pg.screenshot(path=str(ici / 'vues' / 'barde-essai.png'), full_page=True)
    print('coiffures :', pg.evaluate('window.COIF')); print('erreurs :', err or 'aucune'); nav.close()
