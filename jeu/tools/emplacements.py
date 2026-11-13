"""Un héros ne prend jamais la place d'un autre (Romain, 13 novembre, 13 h 57 : « quand on est dans le Pisteur et qu'on appuie sur
L'enquête, ça efface le personnage et ça lance l'Alchimiste » ; moteur-base.js, descente.js).
Quatre onglets du même navigateur, ouverts AVANT de créer les héros (aucun héros n'existe : avant la correction, les quatre prenaient
l'emplacement 1 et s'écrasaient). Puis : chacun crée son héros ; le Pisteur descend dans le donjon et remonte par « 🏘️ L'enquête »
pendant que l'Alchimiste joue ; les trois autres onglets sont rechargés. Chacun doit retrouver SON héros, et le Pisteur revenir dans
l'enquête. Il faut le donjon construit (jeu/donjon/moteur/sortie, ou BRUMEVAL_DONJON=<dossier>).
   BRUMEVAL_DIST=<dossier construit> python3 tools/emplacements.py"""
import sys, os, json, threading, tempfile, shutil, functools
from http.server import ThreadingHTTPServer, SimpleHTTPRequestHandler
from playwright.sync_api import sync_playwright
ICI = os.path.dirname(os.path.abspath(__file__))
DIST = os.path.abspath(os.environ.get('BRUMEVAL_DIST') or os.path.join(ICI, '..', 'dist')); DONJON = os.path.abspath(os.environ.get('BRUMEVAL_DONJON') or os.path.join(ICI, '..', 'donjon', 'moteur', 'sortie'))
class Muet(SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
rac = tempfile.mkdtemp(prefix='brumeval-rep-')
os.makedirs(rac + '/brumeval'); shutil.copy(DIST + '/index.html', rac + '/brumeval/index.html'); os.symlink(DONJON, rac + '/brumeval/donjon')
srv = ThreadingHTTPServer(('127.0.0.1', 0), functools.partial(Muet, directory=rac)); threading.Thread(target=srv.serve_forever, daemon=True).start()
base = f'http://127.0.0.1:{srv.server_address[1]}/brumeval/'
def creer(pg, nom, role):
    pg.click('[data-act=creer]'); pg.click(f'[data-act=crea-role][data-r={role}]'); pg.click('[data-act=crea-suite]'); pg.fill('#nom', nom); pg.click('[data-act=crea-fin]')
    pg.evaluate("() => { M.UI.ecran = 'reglages'; M.render(); }")
    pg.click('[data-act=mode-test][data-i="3"]'); pg.click('#voile [data-act=confirmer-oui]')
    pg.click('[data-act=nouvelle-enquete]'); pg.click('[data-act=lettre-suite]'); pg.click('[data-act=commencer]'); pg.wait_for_timeout(400)
def etat(pg, quoi):
    e = pg.evaluate("""() => { var l = []; for(var i = 1; i <= 8; i++){ var t = localStorage.getItem('brumeval-v2-' + i); if(t){ var s = JSON.parse(t); l.push(i + ':' + (s.heros ? s.heros.role + '/' + s.heros.nom : 'VIDE')); } }
      return {slots:l, em:sessionStorage.getItem('brumeval-emplacement'), moi:(window.M && M.S && M.S.heros) ? M.S.heros.role + '/' + M.S.heros.nom : null, ecran:window.M ? M.UI.ecran : null}; }""")
    print(quoi, json.dumps(e, ensure_ascii=False), flush=True); return e
ok = True
with sync_playwright() as p:
    b = p.chromium.launch(); ctx = b.new_context(viewport={'width': 1180, 'height': 820}, has_touch=True)
    ctx.add_init_script("window.BRUMEVAL_SANS_TUTO = true;")
    ctx.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    ctx.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    roles = ['pisteur', 'alchimiste', 'barde', 'sage']
    pages = []
    for r in roles:     # quatre onglets ouverts d'abord, sans héros
        pg = ctx.new_page(); pg.set_default_timeout(9000); pg.on('pageerror', lambda e: print('PAGEERROR', e)); pg.goto(base + 'index.html#test'); pages.append(pg)
    for pg, r in zip(pages, roles): creer(pg, r.capitalize(), r)
    for pg, r in zip(pages, roles): etat(pg, 'onglet ' + r)
    # l'Alchimiste fait quelque chose (il sauve), puis le Pisteur descend et remonte
    pages[1].evaluate("() => { M.P().onglet = 'carnet'; M.sauver(); M.render(); }")
    pg = pages[0]
    pg.evaluate("""() => { var P = M.P(); P.moment = 2; P.vus['pisteur:clocher:cle'] = 'ok'; P.vus['pisteur:clocher:crypte'] = 'ok'; P.sac = ['feu','huile','colle','acide','baume','coeur','fumigene']; P.vus['sac:recu'] = 1; P.vus['donjon:entree'] = 'crypte'; M.sauver(); M.UI.modal = null; M.ouvrir({type:'descente', retourId:'clocher'}); }""")
    pg.wait_for_timeout(300); pg.locator('#voile [data-act=ds-aller]').click()
    pg.wait_for_url('**/donjon/index.html**'); pg.wait_for_timeout(1500)
    pages[1].evaluate("() => { M.P().onglet = 'carte'; M.sauver(); M.render(); }")     # pendant ce temps, l'Alchimiste joue
    pg.eval_on_selector('[data-act=sac-pret]', 'e => e.click()')
    pg.wait_for_function("() => DJ.Explo.etat().ecran === 'scene' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(600)
    pg.eval_on_selector('#b-repartir', 'e => e.click()')
    pg.wait_for_function("() => DJ.Explo.etat().ecran === 'carte' && !DJ.Explo.etat().occupe", timeout=40000); pg.wait_for_timeout(500)
    pg.eval_on_selector('[data-act=enquete]', 'e => e.click()')
    pg.wait_for_url('**/brumeval/index.html**'); pg.wait_for_timeout(1200)
    e = etat(pg, 'LE PISTEUR REMONTE →')
    ok = e['moi'] == 'pisteur/Pisteur' and e['ecran'] == 'enquete'
    # et les autres onglets, rechargés : chacun retrouve son héros ?
    for q, r in zip(pages[1:], roles[1:]):
        q.reload(); q.wait_for_timeout(700); e = etat(q, 'rechargé ' + r); ok = ok and e['moi'] == r + '/' + r.capitalize()
    b.close()
srv.shutdown()
print('Tout est bon : chacun a gardé son héros.' if ok else 'ÉCHEC : un héros a pris la place d\'un autre.')
sys.exit(0 if ok else 1)
