"""CE QUI SORT DU DONJON (film, musique, bruitages, tout mélangé), MESURÉ AU FIL DU TEMPS AUTOUR D'UN FILM DE LÉO (19 novembre, Bible §13.90).
Claude ne peut pas écouter : cet outil branche un compteur sur la sortie du son de la page et rend, seconde par seconde, le niveau
de tout et le niveau « tablette » (au-dessus de 250 Hz : ce qu'un petit haut-parleur rend vraiment).
    flock /tmp/brumeval-pw.lock python3 ecoute.py sortie entree|a12|b23 [secondes]
    MUET_APRES=bruitages … : les bruitages sont coupés à la fin du film — on ne mesure plus que la musique qui reprend
    MUET_APRES=musique …   : l'inverse
(Mesuré APRÈS le compresseur de sortie, qui remonte ce qui est faible : une musique seule sort vers −21 dB « tablette », comme la
fin de la bande-son d'un film. Les mesures hors ligne de essai/sons/verifier.py sont prises AVANT : ne pas comparer les deux.)"""
import sys, os, json, shutil, subprocess, time, math, threading, http.server, socketserver, functools
from playwright.sync_api import sync_playwright

BUILD, FILM = os.path.abspath(sys.argv[1]), sys.argv[2]
DUREE = float(sys.argv[3]) if len(sys.argv) > 3 else 40
FILMS = os.path.join(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))), 'cine', 'sortie')
RACINE = '/tmp/ecoute-site'
shutil.rmtree(RACINE, ignore_errors=True); os.makedirs(RACINE)
shutil.copytree(BUILD, os.path.join(RACINE, 'donjon')); os.makedirs(os.path.join(RACINE, 'cine'))
for f in os.listdir(FILMS):
    if f.split('.')[0] in ('entree', 'a12', 'b23') and f.endswith(('.mp4', '.mp3')): shutil.copy(os.path.join(FILMS, f), os.path.join(RACINE, 'cine', f))

class H(http.server.SimpleHTTPRequestHandler):
    def log_message(self, *a): pass
socketserver.TCPServer.allow_reuse_address = True
srv = socketserver.ThreadingTCPServer(('127.0.0.1', 0), functools.partial(H, directory=RACINE)); port = srv.server_address[1]
threading.Thread(target=srv.serve_forever, daemon=True).start()

TAP = """
window.__niv = []; window.__marques = [];
(function(){
  var AC = window.AudioContext || window.webkitAudioContext; if(!AC) return;
  var connect = AudioNode.prototype.connect, faits = new WeakMap();
  AudioNode.prototype.connect = function(dest){
    try{
      if(dest && dest === this.context.destination && !(this.context instanceof (window.OfflineAudioContext || function(){}))){
        var c = this.context, T = faits.get(c);
        if(!T){
          T = {};
          T.somme = c.createGain(); T.hp = c.createBiquadFilter(); T.hp.type = 'highpass'; T.hp.frequency.value = 250; T.hp.Q.value = .707;
          T.fusion = c.createChannelMerger(2); T.proc = c.createScriptProcessor(4096, 2, 1); T.muet = c.createGain(); T.muet.gain.value = 0;
          var mono = c.createGain(); mono.channelCount = 1; mono.channelCountMode = 'explicit'; mono.channelInterpretation = 'speakers';
          connect.call(T.somme, mono); connect.call(mono, T.fusion, 0, 0); connect.call(mono, T.hp); connect.call(T.hp, T.fusion, 0, 1);
          connect.call(T.fusion, T.proc); connect.call(T.proc, T.muet); connect.call(T.muet, c.destination);
          T.proc.onaudioprocess = function(e){
            var a = e.inputBuffer.getChannelData(0), b = e.inputBuffer.getChannelData(1), sa = 0, sb = 0;
            for(var i = 0; i < a.length; i++){ sa += a[i] * a[i]; sb += b[i] * b[i]; }
            window.__niv.push([performance.now(), Math.sqrt(sa / a.length), Math.sqrt(sb / a.length)]);
          };
          faits.set(c, T);
        }
        connect.call(this, T.somme);
      }
    }catch(e){}
    return connect.apply(this, arguments);
  };
})();
try{ speechSynthesis.speak = function(){}; }catch(e){}
"""
OBJETS = 'objets=sage:cristal-lune,sage:baton-chene,pisteur:fleches-lourdes,pisteur:fleches-argent&potions=toutes&graine=7'
with sync_playwright() as p:
    nav = p.chromium.launch(args=['--autoplay-policy=no-user-gesture-required'])
    ctx = nav.new_context(viewport={'width': 1024, 'height': 768}, device_scale_factor=1, has_touch=True, is_mobile=True)
    pg = ctx.new_page(); errs = []
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.route('**/fonts.googleapis.com/**', lambda r: r.fulfill(status=200, content_type='text/css', body=''))
    pg.route('**/fonts.gstatic.com/**', lambda r: r.fulfill(status=404, body=''))
    pg.add_init_script(TAP + ('window.__muetApres = "%s";' % os.environ['MUET_APRES'] if os.environ.get('MUET_APRES') else ''))
    base = 'http://127.0.0.1:%d/donjon/index.html' % port
    if FILM == 'entree':
        pg.goto(base + '?combat=leo&phase=1&' + OBJETS)
    else:
        pg.goto(base + '?combat=leo&vu=1&phase=%d&' % (1 if FILM == 'a12' else 2) + OBJETS)
    # (le son se débloque au premier toucher)
    pg.wait_for_timeout(1500); pg.mouse.click(500, 300)
    if FILM != 'entree':
        pg.wait_for_function("() => window.DJ && DJ.Leo && DJ.Leo.etat() && !DJ.Leo.etat().cine", timeout=120000)
        pg.wait_for_timeout(6000)
        pg.evaluate("() => { window.__marques.push(['coup', performance.now()]); var c = DJ.Leo._E().c; c.leo.pv = %s; DJ.Leo.agir('pisteur', %s); }" % (('6030', "'dague'") if FILM == 'a12' else ('3030', "'fleche', 'leo'")))
    # on note quand le film commence et finit (le lecteur pose #cine-lecteur, ou une vidéo)
    pg.evaluate("""() => { var vu = false; (function voir(){ var v = document.querySelector('video'); if(v && !vu){ vu = true; window.__marques.push(['film', performance.now()]);
        v.addEventListener('ended', function(){ window.__marques.push(['fin du film', performance.now()]); }); }
      if(vu && !document.querySelector('video') && !window.__finVu){ window.__finVu = 1; window.__marques.push(['film retiré', performance.now()]); if(window.__muetApres){ try{ window.__muetApres.split(',').forEach(function(k){ SALLE.Son.volume(k, 0); }); }catch(e){} } }
      setTimeout(voir, 30); })(); }""")
    pg.wait_for_timeout(int(DUREE * 1000))
    d = pg.evaluate("() => ({niv:window.__niv, marques:window.__marques, mus:(function(){ try{ return SALLE.Son.precalcul.etat(); }catch(e){ return null; } })()})")
    ctx.close(); nav.close()
srv.shutdown()
niv = d['niv']; marques = d['marques']
print('erreurs :', errs[:3]); print('marques :', [(m[0], round(m[1] / 1000, 2)) for m in marques]); print('mesures :', len(niv))
fin = [m[1] for m in marques if m[0] in ('fin du film', 'film retiré')]
t0 = fin[0] if fin else (niv[0][0] if niv else 0)
def db(x): return 20 * math.log10(max(x, 1e-6))
pas = 250; tmin = -6000; tmax = 30000; lignes = []
for a in range(tmin, tmax, pas):
    l = [n for n in niv if a <= n[0] - t0 < a + pas]
    if not l: continue
    tout = math.sqrt(sum(n[1] ** 2 for n in l) / len(l)); tab = math.sqrt(sum(n[2] ** 2 for n in l) / len(l))
    lignes.append((a / 1000, db(tout), db(tab)))
sec = lambda col: ' '.join('%4.0f' % max(v[col] for v in lignes[i:i + 4]) for i in range(0, len(lignes) - 3, 4))
print('par seconde, de -6 s à la fin :')
print('  tout     :', sec(1))
print('  tablette :', sec(2))
json.dump({'t0': t0, 'niv': niv, 'marques': marques}, open('/tmp/ecoute-%s.json' % FILM, 'w'))
